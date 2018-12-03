#include <Adafruit_DHT.h>

// Number of seconds that the logged event should be active.
#define EVENT_TTL 5

int led = D7; // This is where your LED is plugged in. The other side goes to a resistor connected to GND.

int tmp36 = A0; // This is where your tmp36 is plugged in. The other side goes to the "power" pin (below).
int dht11 = D1; // This is where your dht11 is plugged in. The other side goes to the "power" pin (below).

int power_tmp36 = A5; // This is the other end of your tmp36. The other side is plugged into the "tmp36" pin (above).
int power_dht11 = A4; // This is the other end of your tmp36. The other side is plugged into the "tmp36" pin (above).
// The reason we have plugged one side into an analog pin instead of to "power" is because we want a very steady voltage to be sent to the tmp36.
// That way, when we read the value from the other side of the tmp36, we can accurately calculate a voltage drop.

// How frequently to publish the measurements.
int polling_interval_seconds = 5;

int tmp36_value; // Here we are declaring the integer variable tmp36_value, which we will use later to store the value of the tmp36.
int dht11_h; // Particle variable for Humidity from dht11.
int dht11_c; // Particle variable for Centigrade temperature from dht11.
int dht11_f; // Particle variable for Fahrenheit temperature from dht11.

// Humidity / Temperature sensor reference
DHT dht(dht11, DHT11);

// pushingbox.com configuration
String serverName = "api.pushingbox.com";
String deviceId = "v3164D7B13527772";

// Client used to send EMails
TCPClient client;

void setup() {

    // First, declare all of our pins. This lets our device know which ones will be used for outputting voltage, and which ones will read incoming voltage.
    pinMode(led,OUTPUT); // Our LED pin is output (lighting up the LED)
    pinMode(tmp36,INPUT);  // Our tmp36 pin is input (reading the tmp36)

    // This is handled by the DHT library.
    dht.begin();

    pinMode(power_tmp36,OUTPUT); // The pin powering the tmp36 is output (sending out consistent power)
    pinMode(power_dht11,OUTPUT); // The pin powering the dht11 is output (sending out consistent power)
    // Next, write the power of the tmp36 to be the maximum possible, so that we can use this for power.
    digitalWrite(power_tmp36,HIGH);
    digitalWrite(power_dht11,HIGH);

    // Polling interval.
    Particle.variable("interval_sec", polling_interval_seconds);

    // We are going to declare a Particle.variable() here so that we can access the value of the tmp36 from the cloud.
    Particle.variable("tmp36", tmp36_value);
    Particle.variable("dht11_c", dht11_c);
    Particle.variable("dht11_f", dht11_f);
    Particle.variable("dht11_h", dht11_h);

    // We are also going to declare a Spark.function so that we can turn the LED on and off from the cloud.
    Particle.function("led", ledToggle);
    Particle.function("m", mail);
    // This is saying that when we ask the cloud for the function "led", it will employ the function ledToggle() from this app.
}

void loop() {
    // Wait 5 seconds between measurements.
  	delay(1000 * polling_interval_seconds);

    tmp36_value = analogRead(tmp36);

    // Reading temperature or humidity takes about 250 milliseconds!
    // Sensor readings may also be up to 2 seconds 'old' (its a
    // very slow sensor)
    float h = dht.getHumidity();
    // Read temperature as Celsius
    float c = dht.getTempCelcius();
    // Read temperature as Farenheit
    float f = dht.getTempFarenheit();

    // Check if any reads failed and exit early (to try again).
  	if (isnan(h) || isnan(c) || isnan(f)) {
      Particle.publish("Error", "Failed to read from DHT sensor", EVENT_TTL, PRIVATE);
  		return;
  	}

    dht11_h = (int) h;
    dht11_c = (int) c;
    dht11_f = (int) f;

    Particle.publish("Humidity, %", String(dht11_h), EVENT_TTL, PRIVATE);
    Particle.publish("Temperature, C", String(dht11_c), EVENT_TTL, PRIVATE);
    Particle.publish("Temperature, F", String(dht11_f), EVENT_TTL, PRIVATE);

    String json = "{\"c\":" + String(dht11_c) + ", \"h\":" + String(dht11_h) + "}";
    Particle.publish("JSON", json, EVENT_TTL, PRIVATE);
}

int mail(String command) {
  client.stop();
  if (client.connect(serverName, 80)) {
    String url = "/pushingbox?devid=" + deviceId;
    url += "&h=" + String(dht11_h);
    url += "&c=" + String(dht11_c);
    url +="&f=" + String(dht11_f);
    Particle.publish("EMail", "Sending email: " + url, EVENT_TTL, PRIVATE);
    client.println("GET " + url + " HTTP/1.1");
    client.println("Host: " + serverName);
    client.println("User-Agent: Particle");
    client.println();
    client.flush();
    return 1;
  } else {
    Particle.publish("Error", "Can't connect to server: " + serverName, EVENT_TTL, PRIVATE);
    return -1;
  }
}

int ledToggle(String command) {
    if (command=="on") {
        Particle.publish("LED", "On", EVENT_TTL, PRIVATE);
        digitalWrite(led, HIGH);
        return 1;
    } else if (command=="off") {
        Particle.publish("LED", "Off", EVENT_TTL, PRIVATE);
        digitalWrite(led, LOW);
        return 0;
    } else {
        return -1;
    }
}
