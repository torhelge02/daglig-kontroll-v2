import RPi.GPIO as GPIO
import pyrebase
from time import sleep

config = {
  "apiKey": "api_key_here",
  "authDomain": "auth_domain_here",
  "databaseURL": "database_url_here",
  "storageBucket": "storage_bucket_here"
}

firebase = pyrebase.initialize_app(config)

relay1 = 29		# GPIO 05
relay2 = 31		# GPIO 06
relay3 = 33		# GPIO 13
relay4 = 35		# GPIO 19
relay5 = 37		# GPIO 26

GPIO.setmode(GPIO.BOARD)	# GPIO setup
GPIO.setwarnings(False)
GPIO.setup(relay1,GPIO.OUT)
GPIO.setup(relay2,GPIO.OUT)
GPIO.setup(relay3,GPIO.OUT)
GPIO.setup(relay4,GPIO.OUT)
GPIO.setup(relay5,GPIO.OUT)

try:

    truckStatusOld = ""
    kranAStatusOld = ""
    kranBStatusOld = ""
    kranC10StatusOld = ""
    kranC70StatusOld = ""

    while True:		# Ctrl+C for å avbryte script

        database = firebase.database()
        ProjectBucket = database.child("Status/AVE1")
        truckStatus = ProjectBucket.child("Truck/control").get().val()
        ProjectBucket = database.child("Status/AVE1")
        kranAStatus = ProjectBucket.child("KranA/control").get().val()
        ProjectBucket = database.child("Status/AVE1")
        kranBStatus = ProjectBucket.child("KranB/control").get().val()
        ProjectBucket = database.child("Status/AVE1")
        kranC10Status = ProjectBucket.child("KranC-10tonn/control").get().val()
        ProjectBucket = database.child("Status/AVE1")
        kranC70Status = ProjectBucket.child("KranC-70tonn/control").get().val()

        if truckStatusOld != truckStatus:
            if str(truckStatus) == "OK":
                print()
                print("Truck - Godkjent")
                GPIO.output(relay1, GPIO.HIGH)
            else:
                print()
                print("Truck - Ikke godkjent")
                GPIO.output(relay1, GPIO.LOW)

        if kranAStatusOld != kranAStatus:
            if str(kranAStatus) == "OK":
                print()
                print("Kran A - Godkjent")
                GPIO.output(relay2, GPIO.HIGH)
            else:
                print()
                print("Kran A - Ikke godkjent")
                GPIO.output(relay2, GPIO.LOW)

        if kranBStatusOld != kranBStatus:
            if str(kranBStatus) == "OK":
                print()
                print("Kran B - Godkjent")
                GPIO.output(relay3, GPIO.HIGH)
            else:
                print()
                print("Kran B - Ikke godkjent")
                GPIO.output(relay3, GPIO.LOW)

        if kranC10StatusOld != kranC10Status:
            if str(kranC10Status) == "OK":
                print()
                print("Kran C - 10 tonn - Godkjent")
                GPIO.output(relay4, GPIO.HIGH)
            else:
                print()
                print("Kran C - 10 tonn - Ikke godkjent")
                GPIO.output(relay4, GPIO.LOW)

        if kranC70StatusOld != kranC70Status:
            if str(kranC70Status) == "OK":
                print()
                print("Kran C - 70 tonn - Godkjent")
                GPIO.output(relay5, GPIO.HIGH)
            else:
                print()
                print("Kran C - 70 tonn - Ikke godkjent")
                GPIO.output(relay5, GPIO.LOW)

        truckStatusOld = truckStatus
        kranAStatusOld = kranAStatus
        kranBStatusOld = kranBStatus
        kranC10StatusOld = kranC10Status
        kranC70StatusOld = kranC70Status

        sleep(10)        # Forsinkelse

except KeyboardInterrupt:     # Ctrl+C for å avbryte script
    print("Bye.")
    GPIO.cleanup()            # Rydde opp
