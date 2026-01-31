"""
Test script to verify the entire booking flow.
Run this to test station timing, booking, and payment validation.
"""

import requests
import json
from datetime import datetime, time, timedelta
import time as time_module

# ============================================================================
# CONFIGURATION
# ============================================================================

API_BASE_URL = "http://localhost:8000/api"
STATION_ID = 1
USER_ID = 1

# Colors for terminal output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def print_header(text):
    """Print section header."""
    print(f"\n{BLUE}{'='*70}{RESET}")
    print(f"{BLUE}{text:^70}{RESET}")
    print(f"{BLUE}{'='*70}{RESET}\n")

def print_success(text):
    """Print success message."""
    print(f"{GREEN}✓ {text}{RESET}")

def print_error(text):
    """Print error message."""
    print(f"{RED}✗ {text}{RESET}")

def print_info(text):
    """Print info message."""
    print(f"{YELLOW}ℹ {text}{RESET}")

def print_response(title, response):
    """Pretty print API response."""
    print(f"\n{title}:")
    print(json.dumps(response, indent=2, default=str))

# ============================================================================
# TEST 1: CHECK SERVER HEALTH
# ============================================================================

def test_server_health():
    """Test if server is running."""
    print_header("TEST 1: Server Health Check")
    
    try:
        response = requests.get(f"{API_BASE_URL.replace('/api', '')}/health")
        
        if response.status_code == 200:
            data = response.json()
            print_success("Server is running")
            print(f"  Status: {data['status']}")
            print(f"  Server Time: {data['timestamp']}")
            return True
        else:
            print_error("Server returned error")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to server. Make sure it's running on http://localhost:8000")
        return False
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return False

# ============================================================================
# TEST 2: GET STATION DETAILS
# ============================================================================

def test_get_station_details():
    """Get station details and check status."""
    print_header("TEST 2: Get Station Details")
    
    try:
        url = f"{API_BASE_URL}/stations/{STATION_ID}"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Retrieved station: {data['station_name']}")
            print(f"  Open Time: {data['open_time']}")
            print(f"  Close Time: {data['close_time']}")
            print(f"  Is Open: {GREEN if data['is_open'] else RED}{data['is_open']}{RESET}")
            print(f"  Chargers: {data['total_chargers']}")
            print_response("Full Response", data)
            return data
        else:
            print_error(f"Failed to get station (Status: {response.status_code})")
            print_response("Error", response.json())
            return None
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return None

# ============================================================================
# TEST 3: CHECK LIVE STATUS
# ============================================================================

def test_station_status():
    """Check real-time station open/closed status."""
    print_header("TEST 3: Live Station Status (Auto-Update)")
    
    try:
        url = f"{API_BASE_URL}/stations/{STATION_ID}/status"
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            status_text = GREEN + "OPEN 🟢" if data['is_open'] else RED + "CLOSED 🔴"
            print(f"{status_text}{RESET}")
            print(f"  Open Time: {data['open_time']}")
            print(f"  Close Time: {data['close_time']}")
            print(f"  Current Server Time: {data['current_server_time']}")
            print_response("Full Response", data)
            return data
        else:
            print_error(f"Failed to get status (Status: {response.status_code})")
            return None
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return None

# ============================================================================
# TEST 4: CHECK CHARGER AVAILABILITY
# ============================================================================

def test_charger_availability():
    """Check available chargers for a time slot."""
    print_header("TEST 4: Charger Availability Check")
    
    try:
        # Use a time 2 hours from now
        slot_time = (datetime.now() + timedelta(hours=2)).isoformat()
        
        url = f"{API_BASE_URL}/stations/{STATION_ID}/chargers/available"
        params = {"slot_time": slot_time}
        response = requests.get(url, params=params)
        
        if response.status_code == 200:
            data = response.json()
            if data['available']:
                print_success(f"{data['available_count']} chargers available at {slot_time}")
            else:
                print_info(f"No chargers available at {slot_time}")
            print(f"  Total: {data['total_chargers']}")
            print(f"  Booked: {data['booked_count']}")
            print(f"  Available: {data['available_count']}")
            return data
        else:
            print_error(f"Failed to check availability (Status: {response.status_code})")
            print_response("Error", response.json())
            return None
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return None

# ============================================================================
# TEST 5: CREATE BOOKING
# ============================================================================

def test_create_booking():
    """Create a test booking."""
    print_header("TEST 5: Create Booking")
    
    try:
        # Use a time 2 hours from now
        slot_time = (datetime.now() + timedelta(hours=2)).isoformat()
        
        booking_data = {
            "station_id": STATION_ID,
            "user_id": USER_ID,
            "slot_time": slot_time,
            "duration_minutes": 30,
            "vehicle_number": "TEST-001"
        }
        
        url = f"{API_BASE_URL}/bookings"
        response = requests.post(url, json=booking_data)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success(f"Booking created: #{data['booking']['id']}")
                print(f"  Charger: #{data['booking']['charger_number']}")
                print(f"  Time: {data['booking']['slot_time']}")
                print(f"  Status: {data['booking']['status']}")
                print_response("Full Response", data)
                return data['booking']
            else:
                print_error("Booking creation returned unexpected format")
                return None
        elif response.status_code == 403:
            print_error("BOOKING BLOCKED: Station is closed (As Expected)")
            print_response("Response", response.json())
            return None
        else:
            print_error(f"Failed to create booking (Status: {response.status_code})")
            print_response("Error", response.json())
            return None
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return None

# ============================================================================
# TEST 6: PROCESS PAYMENT
# ============================================================================

def test_process_payment(booking):
    """Process payment for a booking."""
    print_header("TEST 6: Process Payment")
    
    if not booking:
        print_error("No booking provided. Run test_create_booking first.")
        return None
    
    try:
        payment_data = {
            "booking_id": booking['id'],
            "payment_method": "UPI",
            "amount": "100"
        }
        
        url = f"{API_BASE_URL}/payments/process"
        response = requests.post(url, json=payment_data)
        
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                print_success(f"Payment processed successfully")
                print(f"  Transaction ID: {data['transaction']['transaction_id']}")
                print(f"  Amount: ₹{data['transaction']['amount']}")
                print(f"  Status: {data['transaction']['status']}")
                print_response("Full Response", data)
                return data['transaction']
            else:
                print_error("Payment processing returned unexpected format")
                return None
        elif response.status_code == 403:
            print_error("PAYMENT BLOCKED: Station is closed (As Expected)")
            print_response("Response", response.json())
            return None
        else:
            print_error(f"Failed to process payment (Status: {response.status_code})")
            print_response("Error", response.json())
            return None
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return None

# ============================================================================
# TEST 7: LIST ALL BOOKINGS
# ============================================================================

def test_list_bookings():
    """List all bookings."""
    print_header("TEST 7: List All Bookings")
    
    try:
        url = f"{API_BASE_URL}/bookings"
        response = requests.get(url)
        
        if response.status_code == 200:
            bookings = response.json()
            print_success(f"Retrieved {len(bookings)} bookings")
            for booking in bookings[:3]:  # Show first 3
                print(f"  - Booking #{booking['id']}: {booking['status']}")
            if len(bookings) > 3:
                print(f"  ... and {len(bookings) - 3} more")
            return bookings
        else:
            print_error(f"Failed to list bookings (Status: {response.status_code})")
            return None
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return None

# ============================================================================
# TEST 8: LIST ALL STATIONS
# ============================================================================

def test_list_stations():
    """List all stations."""
    print_header("TEST 8: List All Stations")
    
    try:
        url = f"{API_BASE_URL}/stations"
        response = requests.get(url)
        
        if response.status_code == 200:
            stations = response.json()
            print_success(f"Retrieved {len(stations)} stations")
            for station in stations:
                status = GREEN + "OPEN" if station['is_open'] else RED + "CLOSED"
                print(f"  - {station['station_name']} {status}{RESET}")
                print(f"    Hours: {station['open_time']} - {station['close_time']}")
            return stations
        else:
            print_error(f"Failed to list stations (Status: {response.status_code})")
            return None
            
    except Exception as e:
        print_error(f"Error: {str(e)}")
        return None

# ============================================================================
# MAIN TEST SUITE
# ============================================================================

def run_all_tests():
    """Run all tests in sequence."""
    print("\n")
    print(f"{BLUE}{'='*70}")
    print(f"  EV CHARGING STATION BOOKING SYSTEM - TEST SUITE")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*70}{RESET}")
    
    # Test 1: Health check
    if not test_server_health():
        print_error("Server not running. Start it with: python -m uvicorn app.main:app --reload")
        return
    
    # Test 2-4: Station and charger info
    station = test_get_station_details()
    test_station_status()
    availability = test_charger_availability()
    
    # Test 5-6: Booking and payment
    booking = test_create_booking()
    if booking:
        test_process_payment(booking)
    else:
        print_info("Skipping payment test (booking creation may have failed due to station being closed)")
    
    # Test 7-8: List endpoints
    test_list_bookings()
    test_list_stations()
    
    # Summary
    print_header("TESTS COMPLETE")
    print("✓ All tests finished")
    print("\nNOTE: If bookings/payments failed with 403, it's expected - station may be closed.")
    print("      Try running tests during station open hours.")

# ============================================================================
# ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print(f"\n{YELLOW}Tests interrupted by user{RESET}")
    except Exception as e:
        print_error(f"Unexpected error: {str(e)}")
