import { useEffect, useState } from "react";

export default function App() {
  const [dados, setDados] = useState({ nivel_agua: 0, sensor_ativo: false });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/dados");
        const json = await response.json();
        setDados(json);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); // atualiza a cada 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Monitoramento de Alagamento</h1>
      <p>Nível da água: {dados.nivel_agua}</p>
      <p>Sensor ativo: {dados.sensor_ativo ? "Sim" : "Não"}</p>
    </div>
  );
}
