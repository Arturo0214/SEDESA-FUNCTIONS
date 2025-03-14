import { useEffect, useState } from "react";
import { Card, ListGroup, Button, Form, Modal, Badge, Row, Col } from "react-bootstrap";
import Filters from "./Filters";

function ServiceList() {
  const [services, setServices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [currentService, setCurrentService] = useState({ name: "", description: "", area: "" });
  const [bulkServices, setBulkServices] = useState([{ name: "", description: "" }]);
  const [bulkArea, setBulkArea] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  useEffect(() => {
    fetchServices();
  }, []);

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

  const handleCreateOrUpdate = async () => {
    if (!currentService.name || !currentService.description || !currentService.area) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    const url = editMode
      ? `http://localhost:8000/services${selectedId}`
      : "http://localhost:8000/services";

    const method = editMode ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentService),
      });

      if (!response.ok) throw new Error("Error al guardar el servicio");

      fetchServices();
      setShowModal(false);
      setCurrentService({ name: "", description: "", area: "" });
      setEditMode(false);
      setSelectedId(null);
    } catch (error) {
      console.error("Error saving service:", error);
    }
  };

  const handleBulkUpload = async () => {
    const servicesArray = bulkServices
      .filter(service => service.name.trim() && service.description.trim())
      .map(service => ({
        name: service.name.trim(),
        description: service.description.trim(),
        area: bulkArea
      }));

    try {
      const response = await fetch("http://localhost:8000/services/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(servicesArray),
      });

      if (response.ok) {
        fetchServices();
        setShowBulkModal(false);
        setBulkArea("");
        setBulkServices([{ name: "", description: "" }]);
      } else {
        console.error("Error al guardar servicios masivos.");
      }
    } catch (error) {
      console.error("Error en carga masiva:", error);
    }
  };

  const handleAddRow = () => {
    setBulkServices([...bulkServices, { name: "", description: "" }]);
  };

  const handleRemoveRow = (index) => {
    const updatedServices = [...bulkServices];
    updatedServices.splice(index, 1);
    setBulkServices(updatedServices);
  };

  const handleBulkChange = (index, field, value) => {
    const updatedServices = [...bulkServices];
    updatedServices[index][field] = value;
    setBulkServices(updatedServices);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este servicio?")) return;

    try {
      const response = await fetch(`http://localhost:8000/services${id}`, { method: "DELETE" });

      if (!response.ok) throw new Error("Error al eliminar el servicio");

      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
    }
  };

  const handleEdit = (service) => {
    setCurrentService(service);
    setSelectedId(service._id);
    setEditMode(true);
    setShowModal(true);
  };

  const uniqueAreas = [...new Set(services.map((service) => service.area))];

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

        <Button variant="success" className="mb-3 w-100" onClick={() => {
          setCurrentService({ name: "", description: "", area: "" });
          setEditMode(false);
          setShowModal(true);
        }}>
          + Añadir Servicio
        </Button>

        <Button variant="primary" className="mb-4 w-100" onClick={() => {
          setBulkArea("");
          setBulkServices([{ name: "", description: "" }]);
          setShowBulkModal(true);
        }}>
          📥 Carga Masiva
        </Button>

        <Filters setSearchTerm={setSearchTerm} setSelectedArea={setSelectedArea} areas={uniqueAreas} />

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

      {/* Modal Crear/Editar */}
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

      {/* Modal Carga Masiva */}
      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Carga Masiva de Servicios</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Área</Form.Label>
              <Form.Control type="text" value={bulkArea} onChange={(e) => setBulkArea(e.target.value)} />
            </Form.Group>
            {bulkServices.map((service, index) => (
              <Row key={index} className="mb-2 align-items-center">
                <Col>
                  <Form.Control placeholder="Nombre" value={service.name} onChange={(e) => handleBulkChange(index, "name", e.target.value)} />
                </Col>
                <Col>
                <Form.Control
                    placeholder="Descripción"
                    value={service.description}
                    onChange={(e) => handleBulkChange(index, "description", e.target.value)}
                  />
                </Col>
                <Col xs="auto">
                  <Button
                    variant="danger"
                    onClick={() => handleRemoveRow(index)}
                  >
                    🗑️
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="secondary" className="mt-3" onClick={handleAddRow}>
              ➕ Añadir otra fila
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" onClick={handleBulkUpload}>
            Guardar Todo
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}

export default ServiceList;
