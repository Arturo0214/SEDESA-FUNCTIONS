import { useEffect, useState } from "react";
import { Card, ListGroup, Button, Form, Modal, Badge, Row, Col } from "react-bootstrap";
import Filters from "./Filters"; // Importa el componente de filtros

function FunctionList() {
  const [functions, setFunctions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentFunction, setCurrentFunction] = useState({ name: "", description: "", area: "" });
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  useEffect(() => {
    fetchFunctions();
  }, []);

  const fetchFunctions = async () => {
    try {
      const response = await fetch("https://sedesa-back.onrender.com/functions");
      const data = await response.json();
      setFunctions(data);
    } catch (error) {
      console.error("Error fetching functions:", error);
    }
  };

  const handleCreateOrUpdate = async () => {
    const url = editMode
      ? `https://sedesa-back.onrender.com/functions/${selectedId}`
      : "https://sedesa-back.onrender.com/functions";

    const method = editMode ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentFunction),
      });

      if (response.ok) {
        fetchFunctions();
        setShowModal(false);
        setCurrentFunction({ name: "", description: "", area: "" });
        setEditMode(false);
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Error saving function:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`https://sedesa-back.onrender.com/functions/${id}`, { method: "DELETE" });
      fetchFunctions();
    } catch (error) {
      console.error("Error deleting function:", error);
    }
  };

  const handleEdit = (func) => {
    setCurrentFunction(func);
    setSelectedId(func._id);
    setEditMode(true);
    setShowModal(true);
  };

  // Obtener lista única de áreas disponibles
  const uniqueAreas = [...new Set(functions.map((func) => func.area))];

  // Filtrar funciones según el buscador y el área seleccionada
  const filteredFunctions = functions.filter((func) => {
    return (
      func.name.toLowerCase().includes(searchTerm) &&
      (selectedArea === "" || func.area === selectedArea)
    );
  });

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="text-center fw-bold mb-3">📌 Funciones de SEDESA</Card.Title>

        {/* Botón para añadir función */}
        <Button variant="success" className="mb-4 w-100" onClick={() => {
          setCurrentFunction({ name: "", description: "", area: "" }); // Limpia el formulario
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
          {filteredFunctions.map((func) => (
              <ListGroup.Item key={func._id} className="p-3 d-flex flex-column">
                <Row className="align-items-center">
                  <Col md={8}>
                    <h5 className="fw-bold mb-1">{func.name}</h5>
                    <Card.Text className="text-muted mb-1">{func.description}</Card.Text>
                    <Badge bg="info">{func.area}</Badge>
                  </Col>
                  <Col md={4} className="d-flex justify-content-end gap-2">
                    <Button variant="warning" size="sm" onClick={() => handleEdit(func)}>
                      ✏️ Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(func._id)}>
                      🗑️ Eliminar
                    </Button>
                  </Col>
                </Row>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
      </Card.Body>

      {/* Modal para Crear/Editar Función */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Editar Función" : "Añadir Función"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Función</Form.Label>
              <Form.Control
                type="text"
                value={currentFunction.name}
                onChange={(e) => setCurrentFunction({ ...currentFunction, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                value={currentFunction.description}
                onChange={(e) => setCurrentFunction({ ...currentFunction, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Área</Form.Label>
              <Form.Control
                type="text"
                value={currentFunction.area}
                onChange={(e) => setCurrentFunction({ ...currentFunction, area: e.target.value })}
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

export default FunctionList;