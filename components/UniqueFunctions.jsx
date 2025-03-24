// UniqueFunctionsList.jsx
import { useState } from "react";
import { Card, ListGroup, Badge, Container, Row, Col } from "react-bootstrap";
import Filters from "./Filters";

function UniqueFunctions({ functions, services }) {
  const [searchTermSEDESA, setSearchTermSEDESA] = useState("");
  const [selectedAreaSEDESA, setSelectedAreaSEDESA] = useState("");
  const [searchTermSSPCDMX, setSearchTermSSPCDMX] = useState("");
  const [selectedAreaSSPCDMX, setSelectedAreaSSPCDMX] = useState("");

  const matchedFunctionIds = new Set();
  const matchedServiceIds = new Set();

  functions.forEach((func) => {
    services.forEach((service) => {
      if (func.area === service.area) {
        const nameSim = func.name.toLowerCase().includes(service.name.toLowerCase());
        if (nameSim) {
          matchedFunctionIds.add(func._id);
          matchedServiceIds.add(service._id);
        }
      }
    });
  });

  const unmatchedFunctions = functions.filter(f => !matchedFunctionIds.has(f._id));
  const unmatchedServices = services.filter(s => !matchedServiceIds.has(s._id));

  const uniqueAreasSEDESA = [...new Set(unmatchedFunctions.map(f => f.area))];
  const uniqueAreasSSPCDMX = [...new Set(unmatchedServices.map(s => s.area))];

  const filteredFunctions = unmatchedFunctions.filter((func) =>
    func.name.toLowerCase().includes(searchTermSEDESA) &&
    (selectedAreaSEDESA === "" || func.area === selectedAreaSEDESA)
  );

  const filteredServices = unmatchedServices.filter((service) =>
    service.name.toLowerCase().includes(searchTermSSPCDMX) &&
    (selectedAreaSSPCDMX === "" || service.area === selectedAreaSSPCDMX)
  );

  return (
    <Container className="mt-4 mb-5">
      <Row>
        <Col md={6}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="text-center text-danger fw-bold">⚠️ Funciones de SEDESA Únicas</Card.Title>
              <Filters setSearchTerm={setSearchTermSEDESA} setSelectedArea={setSelectedAreaSEDESA} areas={uniqueAreasSEDESA} />
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <ListGroup variant="flush">
                  {filteredFunctions.map((func) => (
                    <ListGroup.Item key={func._id}>
                      <strong>{func.name}</strong> <br />
                      <Badge bg="info">{func.area}</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="text-center text-warning fw-bold">⚠️ Funciones de SSPCDMX Únicas</Card.Title>
              <Filters setSearchTerm={setSearchTermSSPCDMX} setSelectedArea={setSelectedAreaSSPCDMX} areas={uniqueAreasSSPCDMX} />
              <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                <ListGroup variant="flush">
                  {filteredServices.map((service) => (
                    <ListGroup.Item key={service._id}>
                      <strong>{service.name}</strong> <br />
                      <Badge bg="info">{service.area}</Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default UniqueFunctions;