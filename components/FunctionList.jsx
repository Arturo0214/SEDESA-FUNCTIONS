import { useEffect, useState } from "react";
import { Card, ListGroup, Button, Form, Modal, Badge, Row, Col } from "react-bootstrap";
import Filters from "./Filters";

function FunctionList() {
  const [functions, setFunctions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentFunction, setCurrentFunction] = useState({ name: "", description: "", area: "" });
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkArea, setBulkArea] = useState("");
  const [bulkFunctions, setBulkFunctions] = useState([{ name: "", description: "" }]);

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

  const handleAddRow = () => {
    setBulkFunctions([...bulkFunctions, { name: "", description: "" }]);
  };

  const handleRemoveRow = (index) => {
    const updatedFunctions = [...bulkFunctions];
    updatedFunctions.splice(index, 1);
    setBulkFunctions(updatedFunctions);
  };

  const handleBulkChange = (index, field, value) => {
    const updatedFunctions = [...bulkFunctions];
    updatedFunctions[index][field] = value;
    setBulkFunctions(updatedFunctions);
  };

  const handleBulkUpload = async () => {
    const functionsArray = bulkFunctions
      .filter(func => func.name.trim() && func.description.trim())
      .map(func => ({
        name: func.name.trim(),
        description: func.description.trim(),
        area: bulkArea
      }));

    try {
      const response = await fetch("https://sedesa-back.onrender.com/functions/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(functionsArray),
      });

      if (response.ok) {
        fetchFunctions();
        setShowBulkModal(false);
        setBulkArea("");
        setBulkFunctions([{ name: "", description: "" }]);
      } else {
        console.error("Error al guardar funciones masivas.");
      }
    } catch (error) {
      console.error("Error en carga masiva:", error);
    }
  };

  const uniqueAreas = [...new Set(functions.map((func) => func.area))];

  const filteredFunctions = functions.filter((func) => {
    return (
      func.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedArea === "" || func.area === selectedArea)
    );
  });

  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Card.Title className="text-center fw-bold mb-3">📌 Funciones de SEDESA</Card.Title>

        <Button
          variant="success"
          className="mb-3 w-100"
          onClick={() => {
            setCurrentFunction({ name: "", description: "", area: "" });
            setEditMode(false);
            setShowModal(true);
          }}
        >
          + Añadir Función
        </Button>

        <Button
          variant="primary"
          className="mb-4 w-100"
          onClick={() => {
            setBulkArea("");
            setBulkFunctions([{ name: "", description: "" }]);
            setShowBulkModal(true);
          }}
        >
          📥 Carga Masiva
        </Button>

        <Filters setSearchTerm={setSearchTerm} setSelectedArea={setSelectedArea} areas={uniqueAreas} />

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

      <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Carga Masiva de Funciones</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Área</Form.Label>
              <Form.Control type="text" value={bulkArea} onChange={(e) => setBulkArea(e.target.value)} />
            </Form.Group>

            {bulkFunctions.map((func, index) => (
              <Row key={index} className="align-items-center mb-2">
                <Col>
                  <Form.Control
                    placeholder="Nombre"
                    value={func.name}
                    onChange={(e) => handleBulkChange(index, "name", e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Control
                    placeholder="Descripción"
                    value={func.description}
                    onChange={(e) => handleBulkChange(index, "description", e.target.value)}
                  />
                </Col>
                <Col xs="auto">
                  <Button variant="danger" onClick={() => handleRemoveRow(index)}>🗑️</Button>
                </Col>
              </Row>
            ))}
            <Button onClick={handleAddRow}>➕ Añadir</Button>
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

export default FunctionList;