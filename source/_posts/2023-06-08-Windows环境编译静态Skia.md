---
title: Windows环境编译静态Skia
tags:
  - Skia
  - Snippet
categories:
  - - Skia
    - 编译
date: 2023-06-08 13:45:32
---


## 相关本地依赖

- Visual Studio 
- python3
- ninja
- git

> 把python3.exe所在的目录加进PATH环境变量中

## 初始化第三方依赖

```bash
# 配置代理
$env:http_proxy='http://127.0.0.1:23457'
$env:https_proxy='http://127.0.0.1:23457'

python.exe .\tools\git-sync-deps
```

> Notes：有的依赖比较大，如果网络不好可尝试手动处理避免重复尝试下载

## configure

```bash
# release模式，并启用opengl
bin/gn gen out/build --args="is_debug=false skia_use_gl=true"
```

如果提示以下错误

```bash
ERROR at //gn/BUILDCONFIG.gn:138:14: Script returned non-zero exit code.
    win_vc = exec_script("//gn/find_msvc.py", [], "trim string")
             ^----------
Current dir: E:/hzq/thirdparty/skia-main/out/build/
Command: C:/Users/A297/AppData/Local/Microsoft/WindowsApps/python3.exe E:/thirdparty/skia-main/gn/find_msvc.py
Returned 9009.
```

可以把 `C:/Users/A297/AppData/Local/Microsoft/WindowsApps` 路径从 `PATH` 环境变量去掉，并把使用的 `python.exe` 拷贝一份重命名为 `python3.exe` 然后重试

## build

```bash
ninja -C out/build
```

## demo

配置 `include` 和 `lib` 目录



```cpp
#include <tools/fiddle/examples.h>
#include <tools/fiddle/fiddle_main.h>

#include <Windows.h>

#pragma comment(lib, "skia.lib")
#pragma comment(lib, "skshaper.lib")
#pragma comment(lib, "skparagraph.lib")
#pragma comment(lib, "skottie.lib")
#pragma comment(lib, "sksg.lib")
#pragma comment(lib, "opengl32.lib")

static SkCanvas* prepare_canvas(SkCanvas* canvas) {
    canvas->clear(SK_ColorLTGRAY);
    return canvas;
}

REG_FIDDLE(Canvas_drawLine_2, 256, 256, false, 0) {
    void draw(SkCanvas * canvas) {
        SkPaint paint;
        paint.setAntiAlias(true);
        paint.setColor(0xFF9a67be);
        paint.setStrokeWidth(1);
        canvas->drawLine({ 50, 120 }, { 32, 160 }, paint);
    }
}

void draw_window(HWND hWnd, HDC hdc)
{
    RECT rc;
    GetClientRect(hWnd, &rc);

    int width = rc.right - rc.left;
    int height = rc.bottom - rc.top;

    sk_sp<SkColorSpace> colorSpace = SkColorSpace::MakeSRGBLinear();
    SkImageInfo info = SkImageInfo::Make(width, height, kN32_SkColorType,
        kPremul_SkAlphaType, colorSpace);

    auto rasterSurface = SkSurfaces::Raster(info);
    if (rasterSurface) {
        SkCanvas* canvas = rasterSurface->getCanvas();

        example_Canvas_drawLine_2::draw(prepare_canvas(canvas));
        canvas->flush();

        SkPixmap pixmap;
        if (rasterSurface->peekPixels(&pixmap)) {
            BITMAPINFO bmi;
            memset(&bmi, 0, sizeof(bmi));
            bmi.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
            bmi.bmiHeader.biWidth = pixmap.width();
            bmi.bmiHeader.biHeight = -pixmap.height();
            bmi.bmiHeader.biPlanes = 1;
            bmi.bmiHeader.biBitCount = 32;
            bmi.bmiHeader.biCompression = BI_RGB;
            SetDIBitsToDevice(hdc, 0, 0, pixmap.width(), pixmap.height(), 0, 0, 0, pixmap.height(),
                pixmap.addr(), &bmi, DIB_RGB_COLORS);
        }
    }
}

bool register_window_class(const char* class_name, WNDPROC wndproc)
{
    WNDCLASSEXA wc;
    std::memset(&wc, 0, sizeof(wc));

    wc.style = CS_VREDRAW | CS_HREDRAW;
    wc.lpfnWndProc = wndproc;
    wc.cbClsExtra = 0;
    wc.cbWndExtra = 0;
    wc.hInstance = GetModuleHandleA(nullptr);
    wc.hIcon = NULL;
    wc.hIconSm = NULL;
    wc.hCursor = LoadCursor(NULL, IDC_ARROW);
    wc.hbrBackground = reinterpret_cast<HBRUSH>(GetStockObject(WHITE_BRUSH));
    wc.lpszMenuName = "";
    wc.lpszClassName = class_name;
    wc.cbSize = sizeof(wc);

    return !!RegisterClassExA(&wc);
}

HWND create_window(const char* class_name)
{
    HWND hWnd = CreateWindowA(
        class_name,
        " ",
        WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT,
        CW_USEDEFAULT,
        CW_USEDEFAULT,
        CW_USEDEFAULT,
        NULL,
        NULL,
        GetModuleHandle(NULL),
        (LPVOID)nullptr
    );

    ShowWindow(hWnd, SW_NORMAL);
    UpdateWindow(hWnd);

    return hWnd;
}

LRESULT CALLBACK internal_window_callback(HWND hWnd, UINT uMsg, WPARAM wParam, LPARAM lParam)
{
    HDC hdc;
    PAINTSTRUCT ps;

    switch (uMsg) {
    case WM_PAINT:
        hdc = BeginPaint(hWnd, &ps);
        draw_window(hWnd, hdc);
        EndPaint(hWnd, &ps);
        return 0;

    case WM_DESTROY:
        PostQuitMessage(0);
        return 0;
    }

    return DefWindowProc(hWnd, uMsg, wParam, lParam);
}

int get_message_loop()
{
    MSG msg;

    while (GetMessage(&msg, NULL, 0, 0)) {
        TranslateMessage(&msg);
        DispatchMessage(&msg);
    }

    return (int)msg.wParam;
}

int main(int argc, char** argv)
{
    srand(0);
    register_window_class("__skia_demo_window_class__", internal_window_callback);
    create_window("__skia_demo_window_class__");
    return get_message_loop();
}
```

