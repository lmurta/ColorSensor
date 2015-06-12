// TCS230 sensor reading example
//
// This is just to show basic functionality without calibration.
// Utilises the non-blocking version of the reading function.
// Output uses the Serial console.
//Copy MD_TCS230 and FreqOne to arduino-1.0.5/libraries

#include <MD_TCS230.h>
#include <FreqCount.h>

//calibration data
//sensorData sdBlack = { 7770, 6720, 8840 };
//sensorData sdBlack = { 10100, 10750, 18000 };
//sensorData sdWhite = { 111390, 120740, 184490 };

sensorData sdBlack = { 6200, 6130, 10130 };
sensorData sdWhite = { 111390, 120740, 184490 };


sensorData rawData;
//sensorData sdBlack = { 9190, 9240, 14670 };
//sensorData sdWhite = { 239590, 258070, 372860 };

//sensorData sdWhite = { 0, 0, 0 };

// Pin conections
// pin 1 VCC  Green     5V
// pin 2 OUT Blue   pin 5
// pin 3 S2 Purple  pin 6
// pin 4 S3 Grey    pin 7

// pin 5 S0 Brown   pin 10
// pin 6 S1 Red     pin 9
// pin 7 OE Orange  pin 8
// pin 8 GND Yellow    GND

// Pin definitions
#define  S0_OUT  10
#define  S1_OUT  9
#define  S2_OUT  6
#define  S3_OUT  7
#define  OE_OUT  8    // LOW = ENABLED 

//MD_TCS230	CS(S2_OUT, S3_OUT, OE_OUT);
MD_TCS230 CS(S2_OUT, S3_OUT, S0_OUT, S1_OUT); 
String jsonString;

void setup() 
{
  Serial.begin(115200);
//  Serial.println("[TCS230 Simple NON_BLOCKING Example]");
//  Serial.println("\nMove the sensor to different color to see the RGB value");
//  Serial.println("Note: These values are being read in without sensor calibration");
//  Serial.println("and are likely to be far from reality");

  CS.begin();
}

void readSensor()
{
  static  bool  waiting;
  
  if (!waiting)
  {
    CS.read();
    waiting = true;
  }
  else
  {
    if (CS.available()) 
    {
      colorData  rgb;
      CS.setWhiteCal(&sdWhite);//teste
      CS.setDarkCal(&sdBlack);//teste
      CS.getRGB(&rgb);
      CS.getRaw(&rawData);
      
      jsonString = "{\"RGB_R\":";
      jsonString += rgb.value[TCS230_RGB_R];
      jsonString +=",\"RGB_G\":";
      jsonString += rgb.value[TCS230_RGB_G];
      jsonString +=",\"RGB_B\":";
      jsonString += rgb.value[TCS230_RGB_B];
      jsonString +=",\"RAW_R\":";
      jsonString += rawData.value[0];
      jsonString +=",\"RAW_G\":";
      jsonString += rawData.value[1];
      jsonString +=",\"RAW_B\":";
      jsonString += rawData.value[2];
    

      jsonString +="}";
      Serial.println(jsonString);
      
      //Serial.print(");
 /*     Serial.print(rgb.value[TCS230_RGB_R]);
      Serial.print(",");
      Serial.print(rgb.value[TCS230_RGB_G]);
      Serial.print(",");
      Serial.print(rgb.value[TCS230_RGB_B]);
      Serial.print(",");
      Serial.print(rawData.value[0]);
      Serial.print(",");
      Serial.print(rawData.value[1]);
      Serial.print(",");
      Serial.print(rawData.value[2]);
      Serial.print(",");
      Serial.println("*");
*/      
      
      waiting = false;
    }
  }
}


void loop() 
{
  readSensor();
}

