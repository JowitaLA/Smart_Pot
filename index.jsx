import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

function triangle(x, a, b, c) {
  return Math.max(Math.min((x - a) / (b - a), (c - x) / (c - b)), 0);
}

export default function SmartPotGame() {
  const [time, setTime] = useState(8);
  const [soil, setSoil] = useState(50);
  const [light, setLight] = useState(50);
  const [health, setHealth] = useState(80);
  const [message, setMessage] = useState("");

  const dayLight = triangle(time, 6, 12, 18);
  const night = 1 - dayLight;

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => (t + 1) % 24);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  function calculate() {
    const dry = triangle(soil, 0, 0, 40);
    const wet = triangle(soil, 60, 80, 100);

    let waterNeed = dry * 100;

    let healthChange = 0;

    if (soil < 30) healthChange -= 10;
    if (soil > 80) healthChange -= 5;
    if (light < 30 && dayLight > 0.5) healthChange -= 10;
    if (light > 70 && night > 0.5) healthChange -= 5;

    setHealth((h) => Math.max(0, Math.min(100, h + healthChange)));

    if (waterNeed > 60) {
      setMessage("Roślina jest spragniona 💧");
    } else if (wet > 0.5) {
      setMessage("Za dużo wody!");
    } else {
      setMessage("Warunki są OK ✅");
    }
  }

  function waterPlant() {
    setSoil((s) => Math.min(100, s + 20));
  }

  function addLight() {
    setLight((l) => Math.min(100, l + 20));
  }

  const bgColor = dayLight > 0.5 ? "bg-yellow-200" : "bg-blue-900";

  return (
    <div className={`min-h-screen p-6 ${bgColor}`}>
      <Card className="max-w-xl mx-auto rounded-2xl shadow-xl">
        <CardContent className="p-6 space-y-4">
          <h1 className="text-xl font-bold">🌱 Smart Doniczka - Mini Gra</h1>

          <p>Godzina: {time}:00</p>

          <p>Zdrowie rośliny: {health}%</p>

          <div>
            <p>Wilgotność gleby: {soil}</p>
            <input
              type="range"
              min="0"
              max="100"
              value={soil}
              onChange={(e) => setSoil(parseInt(e.target.value))}
            />
          </div>

          <div>
            <p>Światło: {light}</p>
            <input
              type="range"
              min="0"
              max="100"
              value={light}
              onChange={(e) => setLight(parseInt(e.target.value))}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={waterPlant}>Podlej 💧</Button>
            <Button onClick={addLight}>Dodaj światło 💡</Button>
            <Button onClick={calculate}>Sprawdź stan</Button>
          </div>

          <motion.div
            animate={{ scale: health / 100 + 0.5 }}
            className="text-6xl text-center"
          >
            🌿
          </motion.div>

          <p className="text-center">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}
