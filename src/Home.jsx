import { useEffect, useState } from "react";
import FunctionList from "../components/FunctionList";
import ServiceList from "../components/ServiceList";
import MatchFunctionsServices from "../components/MatchFunctionsServices";

function Home() {
  const [functions, setFunctions] = useState([]);
  const [services, setServices] = useState([]);

  // Cargar datos del backend al montar el componente
  useEffect(() => {
    fetchFunctions();
    fetchServices();
  }, []);

  // Función para obtener funciones desde el backend
  const fetchFunctions = async () => {
    try {
      const response = await fetch("https://sedesa-back.onrender.com/functions");
      const data = await response.json();
      setFunctions(data);
    } catch (error) {
      console.error("Error fetching functions:", error);
    }
  };

  // Función para obtener servicios desde el backend
  const fetchServices = async () => {
    try {
      const response = await fetch("https://sedesa-back.onrender.com/services");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Funciones de SEDESA y SSPCDMX</h1>
      <div className="row">
        <div className="col-md-6">
          <FunctionList functions={functions} setFunctions={setFunctions} fetchFunctions={fetchFunctions} />
        </div>
        <div className="col-md-6">
          <ServiceList services={services} setServices={setServices} fetchServices={fetchServices} />
        </div>
      </div>

      <div className="mt-5">
        <MatchFunctionsServices functions={functions} services={services} />
      </div>
    </div>
  );
}

export default Home;
