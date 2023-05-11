---
title: 使用frida捕获动态模块中解码的二进制socket报文
tags:
  - Hook
  - frida
  - socket
  - dll
  - Snippet
categories:
  - - Hook
    - frida
date: 2023-05-11 16:00:19
---


## 安装依赖

```bash
pip install frida
pip install frida-tools
pip install umsgpack
```

## frida脚本

目标是在 `AsyncNet.win32` （其实就是个dll模块）中的 `asn_core_read` 调用返回之后，读取其写入缓冲区的内容，解析然后输出来

`asn_core_read` 的函数签名如下：

```c++
int asn_core_read(
    void* asn_core_obj_ptr,
    int* event_ptr,
    long* wparam_ptr,
    long* lparam_ptr,
    uint8_t* buffer,
    int buffer_size
);
```



```python
# hook_asn_core_read.py

import os
import sys
import json
import zlib
import struct
import frida
import umsgpack
import logging


frida_session = None

def on_receive_im_message(message, data):
    def _event_code_desc(code):
        return {
            0: 'ASYNC_EVT_NEW',
            1: 'ASYNC_EVT_LEAVE',
            2: 'ASYNC_EVT_ESTAB',
            3: 'ASYNC_EVT_DATA',
            4: 'ASYNC_EVT_PROGRESS',
            5: 'ASYNC_EVT_PUSH',
        }.get(code, str(code))
    
    if 'payload' not in message:
        return

    payload = json.loads(message['payload'])

    if payload['type'] == 'exit':
        # if frida_session:
        #     frida_session.detach()
        # os._exit(1)
        pass
    elif payload['type'] == 'msg':
        buffer = bytes(payload["buffer"])

        appid, cmd, eid, uid, flag, version = struct.unpack("<HHIIII", buffer[:20])
        plaintext = buffer[20:]

        if flag & 0x10: # FLAG_COMPRESS
            plaintext = zlib.decompress(plaintext)

        plaintext = umsgpack.unpackb(plaintext)
        
        logging.info(f'event : {_event_code_desc(payload["event"])}, hid : {payload["hid"]}, tag : {payload["tag"]}')
        logging.info(f'appid : {appid}, cmd : {cmd}, eid : {eid}, uid : {uid}, flag : {flag}, version : {version}')
        logging.info(f'{plaintext}')
        
        print('')

def main(target_process):
    global frida_session
    
    frida_session = frida.attach(target_process)
    script = frida_session.create_script("""
        const async_net_base_addr = Module.findBaseAddress('AsyncNet.win32');
        if (!async_net_base_addr) {
            console.error("AsyncNet.win32 module it's not loaded");
            send(JSON.stringify({type: "exit"}));
            Script.stop();
        }

        const asn_core_read_addr = Module.findExportByName('AsyncNet.win32', 'asn_core_read');
        if (!asn_core_read_addr) {
            console.error("asn_core_read_addr not found");
            send(JSON.stringify({type: "exit"}));
            Script.stop();
        }

        console.log('AsyncNet.win32 base address : ' + async_net_base_addr);
        console.log('asn_core_read addr : ' + asn_core_read_addr);

        function im_received(event, hid, tag, addr, size) {
            if (addr.isNull()) {
                return;
            }

            send(
                JSON.stringify({
                    'type': 'msg',
                    "buffer": Array.from(new Uint8Array(addr.readByteArray(size))),
                    "event": event,
                    "hid": hid,
                    "tag": tag
                })
            );
        }

        Interceptor.attach(asn_core_read_addr, {
            // args[0] : obj ptr
            // args[1] : event ptr
            // args[2] : wparam ptr
            // args[3] : lparam ptr
            // args[4] : buffer ptr
            // args[5] : buffer size
            onEnter(args) {
                this.event_ptr = args[1];
                this.wparam_ptr = args[2];
                this.lparam_ptr = args[3];
                this.buffer_ptr = args[4];
            },
            onLeave(retval) {
                if (retval.toInt32() > 0) {
                    im_received(
                        this.event_ptr.readS32(),
                        this.wparam_ptr.readS32(),
                        this.lparam_ptr.readS32(),
                        this.buffer_ptr,
                        parseInt(retval, 16)
                    );
                }
            }
        });

    """)
    script.on('message', on_receive_im_message)
    script.load()

    print("[!] Ctrl+Z and enter to detach and exit.\n\n")
    sys.stdin.read()

    frida_session.detach()

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: %s <process name or PID>" % __file__)
        sys.exit(1)

    try:
        target_process = int(sys.argv[1])
    except ValueError:
        target_process = sys.argv[1]

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s.%(msecs)03d: %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    main(target_process)
```



```bash
# 启动方法
python hook_asn_core_read.py <lieyou.exe 或 pid>
# 退出按ctrl + z后回车
```

