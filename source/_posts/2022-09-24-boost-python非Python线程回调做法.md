---
title: boost::python非Python线程回调做法
tags:
  - Python
  - boost::python
  - Callback
  - 回调
  - Snippet
categories:
  - - Python
    - pyd
    - boost::python
    - callback
date: 2022-09-24 21:49:16
---


## 定义并注册Callback class

以下Callback是在非Python所创建的线程中回调Python中的方法，所以在执行任何Python相关的调用前，最好先调用`PyGILState_Ensure`，另外使用`boost::python::call_method`来调用Python对象中的方法。

> [非Python创建的线程](https://docs.python.org/zh-cn/3/c-api/init.html#non-python-created-threads)
>
> [PyGILState_Ensure](https://docs.python.org/zh-cn/3/c-api/init.html#c.PyGILState_Ensure)
>
> [call_method](https://www.boost.org/doc/libs/1_79_0/libs/python/doc/html/reference/function_invocation_and_creation/boost_python_call_method_hpp.html)

```cpp
/**
 * Callback
 * @brief 在非Python创建的线程中执行回调
 */
class Callback
{
  public:
    Callback()
      : m_self(nullptr)
    {
    }

    explicit Callback(PyObject* self)
      : m_self(self)
    {
    }

    Callback(const Callback& other) noexcept
      : m_self(other.m_self)
    {
        incref();
    }

    Callback(Callback&& other) noexcept
    {
        m_self       = other.m_self;
        other.m_self = nullptr;
    }

    Callback& operator=(const Callback& other) noexcept
    {
        m_self = other.m_self;
        incref();
        return *this;
    }

    Callback& operator=(Callback&& other) noexcept
    {
        m_self       = other.m_self;
        other.m_self = nullptr;
        return *this;
    }

    virtual ~Callback()
    {
        decref();
    }

    void incref()
    {
        if (!m_self) {
            return;
        }

        PyGILState_STATE state = PyGILState_Ensure();
        Py_INCREF(m_self);
        PyGILState_Release(state);
    }

    void decref()
    {
        if (!m_self || !Py_REFCNT(m_self)) {
            return;
        }

        PyGILState_STATE state = PyGILState_Ensure();
        Py_DECREF(m_self);
        PyGILState_Release(state);
    }

    void dispatch(const std::string message)
    {
        if (!m_self) {
            return;
        }

        PyGILState_STATE state = PyGILState_Ensure();
        call_method<void>(m_self, "event", message, boost::python::object());
        PyGILState_Release(state);
    }

    void dispatch(const std::string message, boost::python::dict& data)
    {
        if (!m_self) {
            return;
        }

        PyGILState_STATE state = PyGILState_Ensure();
        call_method<void>(m_self, "event", message, data.copy());
        PyGILState_Release(state);
    }

  protected:
    PyObject* m_self;
};
```

```cpp
BOOST_PYTHON_MODULE(FooModule)
{
    class_<Callback, boost::noncopyable>("Callback", init<PyObject*>());
}
```

## 补充注册回调方法

下面这个例子会在注册回调函数时启动一个C/C++运行时线程，休眠一秒后执行回调。

```cpp
void register_callback(Callback& callback)
{
    std::thread([](Callback callback) {
        std::this_thread::sleep_for(std::chrono::milliseconds(1000));

        callback.dispatch("message_one");

        PyGILState_STATE state = PyGILState_Ensure();
        {
            boost::python::dict data;
            data["key"]   = "ten";
            data["value"] = 10;
            callback.dispatch("message_two", data);
        }
        PyGILState_Release(state);

        std::this_thread::sleep_for(std::chrono::milliseconds(1000));
    }, callback).detach();
}
```

```cpp
BOOST_PYTHON_MODULE(FooModule)
{
    class_<Callback, boost::noncopyable>("Callback", init<PyObject*>());

    def("register_callback", register_callback);
}
```

## Python测试代码

```python
class MyCallback(FooModule.Callback):
    def __init__(self):
        FooModule.Callback.__init__(self, self)

    def event(self, message, data=None):
        print(message)
        print(data)

FooModule.register_callback(MyCallback())
```

