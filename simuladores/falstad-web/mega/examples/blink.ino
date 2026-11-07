// Placa: Arduino Mega or Mega 2560.
// No Falstad: MEGA.D13 -> LED -> resistor de 1k -> terra.
void setup() {
  pinMode(13, OUTPUT);
}
void loop() {
  digitalWrite(13, HIGH);
  delay(500);
  digitalWrite(13, LOW);
  delay(500);
}
