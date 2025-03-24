import { useEffect, useState } from "react";
import { Card, Button, Badge, Row, Col } from "react-bootstrap";
import Filters from "./Filters";

function FunctionList() {
  const [functions, setFunctions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  useEffect(() => {
    fetchFunctions();
  }, []);

  const fetchFunctions = async () => {
    try {
      const response = await fetch("https://water-clever-sage.glitch.me/functions/");
      const data = await response.json();
      setFunctions(data);
    } catch (error) {
      console.error("Error fetching functions:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`https://water-clever-sage.glitch.me/functions/${id}`, { method: "DELETE" });
      fetchFunctions();
    } catch (error) {
      console.error("Error deleting function:", error);
    }
  };

  const handleEdit = (func) => {
    // Aquí puedes enlazar a un modal externo o a otro componente si lo deseas
    console.log("Editar:", func);
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
        <Card.Title className="text-center fw-bold mb-1">📌 Funciones de SEDESA</Card.Title>

        <Filters setSearchTerm={setSearchTerm} setSelectedArea={setSelectedArea} areas={uniqueAreas} />

        <Row className="g-2 mt-3" style={{ maxHeight: "450px", overflowY: "auto" }}>
          {filteredFunctions.map((func) => (
            <Col key={func._id} xs={12} sm={6} md={4} lg={3}>
              <Card className="h-100 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="fw-bold" style={{ fontSize: '0.9rem' }}>
                    {func.name}
                  </Card.Title>
                  <Card.Text className="text-muted" style={{ fontSize: '0.85rem' }}>
                    {func.description}
                  </Card.Text>
                  <Badge bg="info" className="mb-3" style={{ fontSize: '0.75rem' }}>
                    {func.area}
                  </Badge>
                  <div className="mt-auto d-flex justify-content-end gap-2">
                    <Button variant="warning" size="sm" onClick={() => handleEdit(func)}>
                      ✏️ Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(func._id)}>
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

export default FunctionList;