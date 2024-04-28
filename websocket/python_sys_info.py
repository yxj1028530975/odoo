import uuid
import platform
import contextlib
import psutil
import getpass

def get_mac_address():
    # 获取MAC地址
    mac_address = uuid.getnode()

    # 获取操作系统信息
    os_info = platform.platform()

    return f"{mac_address}-{os_info}"

# 获取当前系统用户名

def get_username():
    return getpass.getuser()

def find_processes_by_path(target_path):
    """
    查找在指定路径下运行的所有进程
    :param target_path: 目标路径
    :return: None
    """
    wechat_list = []
    for proc in psutil.process_iter(attrs=['pid', 'name', 'exe']):
        with contextlib.suppress(psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            # 检查进程的exe属性（可执行文件路径）
            if proc.info['exe'] and target_path in proc.info['exe']:
                print(f"PID: {proc.info['pid']}, Name: {proc.info['name']}, Path: {proc.info['exe']}")
                # 根据进程号找到进程关联的tcp服务
                for conn in proc.connections():
                    # 筛选出 Local Address: 0.0.0.0, Remote Address: None, Status: LISTEN 的服务的端口号
                    if conn.laddr.ip == '0.0.0.0' and not conn.raddr and conn.status == 'LISTEN':
                        print(f"Port: {conn.laddr.port}")
                        wechat_list.append({'pid': proc.info['pid'], 'port': conn.laddr.port})
    return wechat_list
if __name__ == '__main__':
    print(get_mac_address())
    print(get_username())
    target_path = r'D:\wechat310\WeChat\WeChat.exe'
    wechat_list = find_processes_by_path(target_path)
    print(wechat_list)