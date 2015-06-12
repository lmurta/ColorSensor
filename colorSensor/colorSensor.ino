
//-----------------------------
//Uses no library :-)
//-----------------------------

// Programa : Detector de cores usando modulo TCS230  
// Alteracoes e comentarios : Arduino e Cia  
//  
// Baseado no programa original de Martin Mason  
   
//Pinos de conexao do modulo TCS230  
const int s0 = 3;  
const int s1 = 4;  
const int s2 = 5;  
const int s3 = 6;  
const int out = 2;   
   
//Pinos dos leds  
int pinoledverm = 2;   //You may ignore this. Unused unless you want to light LEDs
int pinoledverd = 3;   //You may ignore this. Unused unless you want to light LEDs 
int pinoledazul = 4;   //You may ignore this. Unused unless you want to light LEDs 
    
//Variaveis que armazenam o valor das cores  
int red = 0;  
int green = 0;  
int blue = 0;  
    
void setup()   
{  
  pinMode(s0, OUTPUT);  
  pinMode(s1, OUTPUT);  
  pinMode(s2, OUTPUT);  
  pinMode(s3, OUTPUT);  
  pinMode(out, INPUT);  
  pinMode(pinoledverm, OUTPUT);  
  pinMode(pinoledverd, OUTPUT);  
  pinMode(pinoledazul, OUTPUT);  
  Serial.begin(9600);  
  digitalWrite(s0, HIGH);  
  digitalWrite(s1, HIGH);  
}  
    
void loop() 
{  
  color(); //Chama a rotina que le as cores  
  //Mostra no serial monitor os valores detectados  
  Serial.print("Red :");  
  Serial.print(red, DEC);  
  Serial.print(" Green : ");  
  Serial.print(green, DEC);  
  Serial.print(" Blue : ");  
  Serial.print(blue, DEC);  
  Serial.println();  

  //Verifica se a cor vermelha foi detectada  
  if (red < blue && red < green && red > 50)  
  {  
   Serial.println("Red");  
   digitalWrite(pinoledverm, HIGH); //Acende o led vermelho  
   digitalWrite(pinoledverd, LOW);  
   digitalWrite(pinoledazul, LOW);  
  }  

  //Verifica se a cor azul foi detectada  
  else if (blue < red && blue < green)   
  {  
   Serial.println("Blue");  
   digitalWrite(pinoledverm, LOW);  
   digitalWrite(pinoledverd, LOW);  
   digitalWrite(pinoledazul, HIGH); //Acende o led azul  
  }  

  //Verifica se a cor verde foi detectada  
  else if (green < red && green < blue)  
  {  
   Serial.println("Green");  
   digitalWrite(pinoledverm, LOW);  
   digitalWrite(pinoledverd, HIGH); //Acende o led verde  
   digitalWrite(pinoledazul, LOW);  
  }  
  Serial.println();  

  //Aguarda 2 segundos, apaga os leds e reinicia o processo  
  delay(500);   
  digitalWrite(pinoledverm, LOW);  
  digitalWrite(pinoledverd, LOW);  
  digitalWrite(pinoledazul, LOW);  
 }  
    
void color()  
{  
  //Rotina que le o valor das cores  
  digitalWrite(s2, LOW);  
  digitalWrite(s3, LOW);  
  //count OUT, pRed, RED  
  red = pulseIn(out, digitalRead(out) == HIGH ? LOW : HIGH);  
  digitalWrite(s3, HIGH);  
  //count OUT, pBLUE, BLUE  
  blue = pulseIn(out, digitalRead(out) == HIGH ? LOW : HIGH);  
  digitalWrite(s2, HIGH);  
  //count OUT, pGreen, GREEN  
  green = pulseIn(out, digitalRead(out) == HIGH ? LOW : HIGH);  
}
