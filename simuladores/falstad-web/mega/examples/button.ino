// Placa: Arduino Mega or Mega 2560.
// A chave aplica 5 V a MEGA.D22; um resistor de 10k mantém 0 V quando aberta.
// MEGA.D13 alimenta o LED através de um resistor de 1k.
void setup() {
  pinMode(22, INPUT);
  pinMode(13, OUTPUT);
  Serial.begin(9600);
}
void loop() {
  int botao = digitalRead(22);
  digitalWrite(13, botao);
  Serial.println(botao);
  delay(100);
}
