import websocket
import _thread
import rel
from python_jc import find_processes_by_path
from python_sys_info import get_mac_address,find_processes_by_path,get_username

def on_message(ws, message):
    print(message)

def on_error(ws, error):
    print(error)

def on_close(ws, close_status_code, close_msg):
    print("### closed ###")

def on_open(ws):
    print("Opened connection")

if __name__ == "__main__":
    websocket.enableTrace(True)
    mac_address = get_mac_address()
    username = get_username()
    ws = websocket.WebSocketApp(
        f"ws://localhost:8765?origin=client&user=1&password=1&mac_address={mac_address}&username={username}",
        on_open=on_open,
        on_message=on_message,
        on_error=on_error,
        on_close=on_close,
    )

    ws.run_forever(dispatcher=rel, reconnect=5)  # Set dispatcher to automatic reconnection, 5 second reconnect delay if connection closed unexpectedly
    rel.signal(2, rel.abort)  # Keyboard Interrupt
    rel.dispatch()