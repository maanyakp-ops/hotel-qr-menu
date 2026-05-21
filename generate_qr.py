import qrcode
import os

# Your live URL
BASE_URL = "https://hotel-qr-menu-gamma.vercel.app"

# Hotel details
HOTEL_ID = "00000000-0000-0000-0000-000000000001"
HOTEL_NAME = "test_hotel"

# List your room numbers here
ROOMS = ["101", "102", "103", "104", "105"]

# Create a folder to save QR codes
folder = f"qr_codes_{HOTEL_NAME}"
os.makedirs(folder, exist_ok=True)

# Generate one QR per room
for room in ROOMS:
    url = f"{BASE_URL}/menu/{HOTEL_ID}/{room}"
    img = qrcode.make(url)
    filename = f"{folder}/room_{room}.png"
    img.save(filename)
    print(f"Generated: {filename}")

print(f"\nDone! {len(ROOMS)} QR codes saved in '{folder}' folder")