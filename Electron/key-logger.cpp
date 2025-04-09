#define UNICODE
#define _UNICODE

#include <iostream>
#include <Windows.h>
using namespace std;

LRESULT CALLBACK RawInputProc(HWND hwnd, UINT msg, WPARAM wParam, LPARAM lParam)
{
	// cout << msg;
	if (msg == WM_INPUT)
	{
		RAWINPUTHEADER rawHeader;
		UINT sizeHeader = sizeof(RAWINPUTHEADER);
		GetRawInputData(reinterpret_cast<HRAWINPUT>(lParam), RID_HEADER, &rawHeader, &sizeHeader, sizeof(RAWINPUTHEADER));

		RAWINPUT raw;
		UINT size = sizeof(RAWINPUT);
		GetRawInputData(reinterpret_cast<HRAWINPUT>(lParam), RID_INPUT, &raw, &size, sizeof(RAWINPUTHEADER));

		string result;

		if (rawHeader.dwType == RIM_TYPEKEYBOARD)
		{
			
			result.append(to_string(raw.data.keyboard.VKey)).append(",").append(to_string(raw.data.keyboard.Flags)).append(",");

			cout << result << rawHeader.hDevice << endl;
		}
		else if (rawHeader.dwType == RIM_TYPEMOUSE)
		{
			if(raw.data.mouse.ulButtons > 0 && raw.data.mouse.ulButtons < 33) {
				result.append(to_string(raw.data.mouse.usFlags)).append(",")
				.append(to_string(raw.data.mouse.ulButtons-1)).append(",");

				cout << result << rawHeader.hDevice << endl;
			}
		}
	}

	return DefWindowProc(hwnd, msg, wParam, lParam);
}

int main()
{
	WNDCLASS wc = {0};
	wc.lpfnWndProc = RawInputProc;
	wc.hInstance = GetModuleHandle(nullptr);
	wc.lpszClassName = L"RawInputExample"; // Use L prefix for wide string
	RegisterClass(&wc);

	HWND hwnd = CreateWindow(L"RawInputExample", L"RawInputExample", 0, 0, 0, 0, 0, HWND_MESSAGE, 0, 0, 0);

	RAWINPUTDEVICE rid[2]; // Two devices: one for keyboard and one for mouse
	rid[0].usUsagePage = 0x01;
	rid[0].usUsage = 0x06; // Keyboard
	rid[0].dwFlags = RIDEV_INPUTSINK;
	rid[0].hwndTarget = hwnd;

	rid[1].usUsagePage = 0x01;
	rid[1].usUsage = 0x02; // Mouse
	rid[1].dwFlags = RIDEV_INPUTSINK;
	rid[1].hwndTarget = hwnd;

	RegisterRawInputDevices(rid, 2, sizeof(RAWINPUTDEVICE));

	MSG msg;
	while (GetMessage(&msg, nullptr, 0, 0))
	{
		TranslateMessage(&msg);
		DispatchMessage(&msg);
	}

	// return 0;
}
