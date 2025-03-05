import { useEffect, useState } from "react";
import { Card, ListGroup, Button, Form, Modal, Badge, Row, Col } from "react-bootstrap";
import Filters from "./Filters"; // Importa el componente de filtros

function ServiceList() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentService, setCurrentService] = useState({ name: "", description: "", area: "" });
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

  // Obtener todos los servicios
  const fetchServices = async () => {
    try {
      const response = await fetch("http://localhost:8000/services");
      if (!response.ok) throw new Error("Error al obtener los servicios");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  // Crear o actualizar un servicio
  const handleCreateOrUpdate = async () => {
    if (!currentService.name || !currentService.description || !currentService.area) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    const url = editMode
      ? `http://localhost:8000/services/${selectedId}`
      : "http://localhost:8000/services";

    const method = editMode ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentService),
      });

      if (!response.ok) throw new Error("Error al guardar el servicio");

      fetchServices(); // Refrescar la lista de servicios
      setShowModal(false);
      setCurrentService({ name: "", description: "", area: "" });
      setEditMode(false);
      setSelectedId(null);
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  // Eliminar un servicio
  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) return;

    try {
      const response = await fetch(`http://localhost:8000/services/${id}`, { method: "DELETE" });

      if (!response.ok) throw new Error("Error al eliminar el servicio");

      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  // Editar un servicio
  const handleEdit = (service) => {
    setCurrentService(service);
    setSelectedId(service._id);
    setEditMode(true);
    setShowModal(true);
  };

  // Obtener lista única de áreas disponibles
  const uniqueAreas = [...new Set(services.map((service) => service.area))];

  // Filtrar servicios según el buscador y el área seleccionada
  const filteredServices = services.filter((service) => {
    return (
      service.name.toLowerCase().includes(searchTerm) &&
      (selectedArea === "" || service.area === selectedArea)
    );
  });

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="text-center fw-bold mb-3">🩺 Funciones de SSPCDMX</Card.Title>

        {/* Botón para añadir servicio */}
        <Button variant="success" className="mb-4 w-100" onClick={() => {
          setCurrentService({ name: "", description: "", area: "" }); // Limpia el formulario
          setEditMode(false);
          setShowModal(true);
        }}>
          + Añadir Función
        </Button>

        {/* Filtros */}
        <Filters setSearchTerm={setSearchTerm} setSelectedArea={setSelectedArea} areas={uniqueAreas} />

        {/* Lista con Scroll */}
        <div style={{ maxHeight: "250px", overflowY: "auto" }}>
          <ListGroup variant="flush">
            {filteredServices.map((service) => (
              <ListGroup.Item key={service._id} className="p-3 d-flex flex-column">
                <Row className="align-items-center">
                  <Col md={8}>
                    <h5 className="fw-bold mb-1">{service.name}</h5>
                    <Card.Text className="text-muted mb-1">{service.description}</Card.Text>
                    <Badge bg="info">{service.area}</Badge>
                  </Col>
                  <Col md={4} className="d-flex justify-content-end gap-2">
                    <Button variant="warning" size="sm" onClick={() => handleEdit(service)}>
                      ✏️ Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(service._id)}>
                      🗑️ Eliminar
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </Card.Body>

      {/* Modal para Crear/Editar Servicio */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Editar Servicio" : "Añadir Servicio"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                value={currentService.name}
                onChange={(e) => setCurrentService({ ...currentService, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                value={currentService.description}
                onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Área</Form.Label>
              <Form.Control
                type="text"
                value={currentService.area}
                onChange={(e) => setCurrentService({ ...currentService, area: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleCreateOrUpdate}>
            {editMode ? "Actualizar" : "Guardar"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}

export default ServiceList;