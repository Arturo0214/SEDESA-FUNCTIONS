import { useState } from "react";
import { Card, ListGroup, Badge, Container, Row, Col } from "react-bootstrap";
import Filters from "./Filters";

function UniqueFunctions({ functions, services, matches }) {
  const [searchTermSEDESA, setSearchTermSEDESA] = useState("");
  const [selectedAreaSEDESA, setSelectedAreaSEDESA] = useState("");
  const [searchTermSSPCDMX, setSearchTermSSPCDMX] = useState("");
  const [selectedAreaSSPCDMX, setSelectedAreaSSPCDMX] = useState("");

  // Usa los matches reales
  const matchedFunctionIds = new Set(matches.map((m) => m.functionId));
  const matchedServiceIds = new Set(matches.map((m) => m.serviceId));

  const unmatchedFunctions = functions.filter(f => !matchedFunctionIds.has(f._id));
  const unmatchedServices = services.filter(s => !matchedServiceIds.has(s._id));

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
        {/* Funciones SEDESA */}
        <Col md={6}>
          <Card className="shadow border-0">
            <Card.Body>
              <Card.Title className="text-center text-danger fw-bold">
                ⚠️ Funciones de SEDESA Únicas
              </Card.Title>
              <Filters
                setSearchTerm={setSearchTermSEDESA}
                setSelectedArea={setSelectedAreaSEDESA}
                areas={uniqueAreasSEDESA}
              />
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                <ListGroup variant="flush">
                  {filteredFunctions.map((func) => (
                    <ListGroup.Item
                      key={func._id}
                      className="mb-3 p-3 rounded border shadow-sm"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="fw-semibold mb-1">{func.name}</h6>
                          <Badge bg="danger" className="mt-1">
                            {func.area}
                          </Badge>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Funciones SSPCDMX */}
        <Col md={6}>
          <Card className="shadow border-0">
            <Card.Body>
              <Card.Title className="text-center text-warning fw-bold">
                ⚠️ Funciones de SSPCDMX Únicas
              </Card.Title>
              <Filters
                setSearchTerm={setSearchTermSSPCDMX}
                setSelectedArea={setSelectedAreaSSPCDMX}
                areas={uniqueAreasSSPCDMX}
              />
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                <ListGroup variant="flush">
                  {filteredServices.map((service) => (
                    <ListGroup.Item
                      key={service._id}
                      className="mb-3 p-3 rounded border shadow-sm"
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h6 className="fw-semibold mb-1">{service.name}</h6>
                          <Badge bg="warning" text="dark" className="mt-1">
                            {service.area}
                          </Badge>
                        </div>
                      </div>
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
