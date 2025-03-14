import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../src/features/auth/authSlice";
import FunctionList from "../../components/FunctionList";
import ServiceList from "../../components/ServiceList";
import MatchFunctionsServices from "../../components/MatchFunctionsServices";
import { Container, Row, Col, Button } from "react-bootstrap";
import { List, Home as HomeIcon, Search, LogOut } from "lucide-react";
import Swal from "sweetalert2";

function Home() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [functions, setFunctions] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedTab, setSelectedTab] = useState("functions");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      fetchFunctions();
      fetchServices();
    }
  }, [user, navigate]);

  const fetchFunctions = async () => {
    try {
      const response = await fetch("http://localhost:8000/functions");
      const data = await response.json();
      setFunctions(data);
    } catch (error) {
      console.error("Error fetching functions:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch("http://localhost:8000/services");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Tu sesión se cerrará.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch(logout());
        navigate("/login");
        Swal.fire("Cerrado", "Tu sesión ha sido cerrada.", "success");
      }
    });
  };

  return (
    <Container fluid className="d-flex justify-content-center align-items-center admin">
      <Row className="w-100">
        {/* Sidebar (Menú lateral) */}
        <Col md={3} className="admin-left p-4">
          <h4 className="text-center mb-4">Sistema SEDESA</h4>
          <div className="d-flex flex-column">
            <Button
              className={`admin-section ${selectedTab === "functions" ? "selected" : ""}`}
              onClick={() => setSelectedTab("functions")}
              variant="dark"
            >
              <List className="me-2" /> Funciones
            </Button>
            <Button
              className={`admin-section ${selectedTab === "services" ? "selected" : ""}`}
              onClick={() => setSelectedTab("services")}
              variant="dark"
            >
              <HomeIcon className="me-2" /> Servicios
            </Button>
            <Button
              className={`admin-section ${selectedTab === "matches" ? "selected" : ""}`}
              onClick={() => setSelectedTab("matches")}
              variant="dark"
            >
              <Search className="me-2" /> Comparar Funciones
            </Button>
            <Button
              className="admin-section mt-4"
              onClick={handleLogout}
              variant="danger"
            >
              <LogOut className="me-2" /> Cerrar Sesión
            </Button>
          </div>
        </Col>

        {/* Contenido dinámico */}
        <Col md={9} className="admin-right p-4">
          {selectedTab === "functions" && (
            <FunctionList functions={functions} setFunctions={setFunctions} fetchFunctions={fetchFunctions} />
          )}
          {selectedTab === "services" && (
            <ServiceList services={services} setServices={setServices} fetchServices={fetchServices} />
          )}
          {selectedTab === "matches" && <MatchFunctionsServices functions={functions} services={services} />}
        </Col>
      </Row>
    </Container>
  );
}

export default Home;