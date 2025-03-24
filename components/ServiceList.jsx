import { useEffect, useState } from "react";
import { Card, Button, Badge, Row, Col } from "react-bootstrap";
import Filters from "./Filters";

const API_URL = import.meta.env.VITE_API_URL;

function ServiceList() {
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}services`);
      if (!response.ok) throw new Error("Error al obtener los servicios");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) return;

    try {
      const response = await fetch(`${API_URL}services/${id}`, { method: "DELETE" });

      if (!response.ok) throw new Error("Error al eliminar el servicio");

      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const handleEdit = (service) => {
    // Puedes abrir aquí un modal externo o enlazar a un editor aparte
    console.log("Editar servicio:", service);
  };

  const uniqueAreas = [...new Set(services.map((service) => service.area))];

  const filteredServices = services.filter((service) => {
    return (
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedArea === "" || service.area === selectedArea)
    );
  });

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="text-center fw-bold mb-3">🩺 Funciones de SSPCDMX</Card.Title>

        <Filters setSearchTerm={setSearchTerm} setSelectedArea={setSelectedArea} areas={uniqueAreas} />

        <Row className="g-2 mt-3" style={{ maxHeight: "600px", overflowY: "auto" }}>
          {filteredServices.map((service) => (
            <Col key={service._id} xs={12} sm={6} md={4} lg={3}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fw-bold" style={{ fontSize: "0.9rem" }}>
                    {service.name}
                  </Card.Title>
                  <Card.Text className="text-muted" style={{ fontSize: "0.85rem" }}>
                    {service.description}
                  </Card.Text>
                  <Badge bg="info" className="mb-3" style={{ fontSize: "0.75rem" }}>
                    {service.area}
                  </Badge>
                  <div className="mt-auto d-flex justify-content-end gap-2">
                    <Button variant="warning" size="sm" onClick={() => handleEdit(service)}>
                      ✏️ Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(service._id)}>
                      🗑️ Eliminar
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );
}

export default ServiceList;