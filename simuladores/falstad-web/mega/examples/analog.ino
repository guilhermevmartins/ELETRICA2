// Placa: Arduino Mega or Mega 2560.
// Edite a fonte de 0 a 5 V ligada a MEGA.A15.
// Veja os pulsos PWM em MEGA.D44 e o brilho do LED.
void setup() {
  pinMode(44, OUTPUT);
  Serial.begin(9600);
}
void loop() {
  int leitura = analogRead(A15);
  int intensidade = map(leitura, 0, 1023, 0, 255);
  analogWrite(44, intensidade);
  Serial.println(leitura);
  delay(100);
}
