---
title: 在Visual Studio中开发pyd动态库模块
tags:
  - Python
  - pyd
  - Visual Studio
  - Snippet
categories:
  - - Visual Studio
    - Python
    - pyd
  - - Python
    - pyd
date: 2022-09-08 11:10:30
---


## Visual Studio依赖

在Visual Studio 2017之前版本需要手动搭建Python的pyd模块开发环境，Visual Studio 2017或更高版本，可安装Python开发工作负载，其内包含了Python本机开发工具，可以直接使用**Python 扩展模块**模板来初始化pyd项目。

![](../images/post/visual_studio_pyd_dev/visual_studio_install_python_dev_tool.png)

## 以Python扩展模块模板创建项目

![](../images/post/visual_studio_pyd_dev/visual_studio_create_pyd_project.png)

项目生成的实际上就是**dll模块**，不过会把**目标文件扩展名**修改为**pyd**，同时会把Python相关的**头文件**和**库文件**路径自动引入进来。另外该模板使用的调试器是**Python/Native Debugging**，调试时会启动一个Python Shell，并自动把项目模块import进来。

如果想要单独创建一个**测试用例**项目可以这么做，创建一个Python子项目，然后把pyd模块的**生成路径**包含进**搜索路径**中，不过一般可能没这个必要，看实际需求。

![](../images/post/visual_studio_pyd_dev/testcase_subproject.png)

## 开发相关指引

- Python模块的公用头文件是Python.h
- 写pyd模块的目的有可能是为某个还没有Python Binding的库编写Wrapper，那么可以在项目中把该库的头文件和库文件路径引入进来
- 需要注意32位或64位匹配
- 具体的开发方式以及结构组织请直接看官方文档

> 相关开发手册和Example可以查看以下链接：
>
> - [创建适用于 Python 的 C++ 扩展](https://docs.microsoft.com/zh-cn/visualstudio/python/working-with-c-cpp-python-in-visual-studio?view=vs-2022)
> - [microsoft/python-sample-vs-cpp-extension](https://github.com/Microsoft/python-sample-vs-cpp-extension)
> - [Python/C API 参考手册](https://docs.python.org/zh-cn/3/c-api/index.html)
> - [扩展和嵌入 Python 解释器](https://docs.python.org/zh-cn/3/extending/index.html)

## 示例说明

模块名：BytertcSDKWrapper

模块内方法：example

```c++
#include <Python.h>

/*
 * 实现example方法.
 */

// example方法的文档说明
PyDoc_STRVAR(BytertcSDKWrapper_example_doc, "example(obj, number)\
\
Example function");

// example方法实现
PyObject *BytertcSDKWrapper_example(PyObject *self, PyObject *args, PyObject *kwargs) {
    /* Shared references that do not need Py_DECREF before returning. */
    PyObject *obj = NULL;
    int number = 0;

    /* Parse positional and keyword arguments */
    static char* keywords[] = { "obj", "number", NULL };
    if (!PyArg_ParseTupleAndKeywords(args, kwargs, "Oi", keywords, &obj, &number)) {
        return NULL;
    }

    /* Function implementation starts here */

    if (number < 0) {
        PyErr_SetObject(PyExc_ValueError, obj);
        return NULL;    /* return NULL indicates error */
    }

    Py_RETURN_NONE;
}

/*
 * 列出加入BytertcSDKWrapper模块的所有方法，在exec_BytertcSDKWrapper中使用.
 */
static PyMethodDef BytertcSDKWrapper_functions[] = {
    { "example", (PyCFunction)BytertcSDKWrapper_example, METH_VARARGS | METH_KEYWORDS, BytertcSDKWrapper_example_doc },
    { NULL, NULL, 0, NULL } /* 标注结尾 */
};

/*
 * 初始化BytertcSDKWrapper模块，可能会被多次调用，所以需要避免使用static状态.
 */
int exec_BytertcSDKWrapper(PyObject *module) {
    // 注册要添加的方法
    PyModule_AddFunctions(module, BytertcSDKWrapper_functions);

    // 添加一些模块的元信息
    PyModule_AddStringConstant(module, "__author__", "huzhiqin");
    PyModule_AddStringConstant(module, "__version__", "1.0.0");
    PyModule_AddIntConstant(module, "year", 2022);

    return 0; /* success */
}

/*
 * BytertcSDKWrapper模块文档信息.
 */
PyDoc_STRVAR(BytertcSDKWrapper_doc, "The BytertcSDKWrapper module");

/*
 * 模块slot，有create和exec slot，这里登记的是exec.
 *
 * @notes: New in 3.5
 */
static PyModuleDef_Slot BytertcSDKWrapper_slots[] = {
    { Py_mod_exec, exec_BytertcSDKWrapper },
    { 0, NULL }
};

/*
 * 模块定义.
 */
static PyModuleDef BytertcSDKWrapper_def = {
    PyModuleDef_HEAD_INIT,
    "BytertcSDKWrapper",     /* 模块名字，必须与“配置属性”>“常规”>“目标名称”一致 */
    BytertcSDKWrapper_doc,   /* 模块文档描述 */
    0,                       /* m_size */
    NULL,                    /* m_methods */
    BytertcSDKWrapper_slots, /* create or exec */
    NULL,                    /* m_traverse */
    NULL,                    /* m_clear */
    NULL,                    /* m_free */
};

/*
 * 导出BytertcSDKWrapper模块，必须以PyInit_<module-name>，这样的方式命名.
 */
PyMODINIT_FUNC PyInit_BytertcSDKWrapper() {
    return PyModuleDef_Init(&BytertcSDKWrapper_def);
}
```

