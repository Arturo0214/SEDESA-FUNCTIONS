import { useEffect, useState } from "react";
import { Card, ListGroup, Badge, Container, Row, Col, Form } from "react-bootstrap";
import stringSimilarity from "string-similarity";

// Función para limpiar texto
const cleanText = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ") // Reemplazar múltiples espacios con uno solo
    .replace(/[^\w\s]/g, ""); // Eliminar signos de puntuación
};

// Componente de Filtros
function Filters({ setSearchTerm, setSelectedArea, areas }) {
  return (
    <div className="mb-3">
      <Form.Control
        type="text"
        placeholder="🔍 Buscar función..."
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
      />
      <Form.Select className="mt-2" onChange={(e) => setSelectedArea(e.target.value)}>
        <option value="">📌 Filtrar por área</option>
        {areas.map((area, index) => (
          <option key={index} value={area}>{area}</option>
        ))}
      </Form.Select>
    </div>
  );
}

function MatchFunctionsServices({ functions, services }) {
  const [matches, setMatches] = useState([]);

  // Estados para los filtros
  const [searchTermSEDESA, setSearchTermSEDESA] = useState("");
  const [selectedAreaSEDESA, setSelectedAreaSEDESA] = useState("");
  const [searchTermSSPCDMX, setSearchTermSSPCDMX] = useState("");
  const [selectedAreaSSPCDMX, setSelectedAreaSSPCDMX] = useState("");

  useEffect(() => {
    autoMatch();
  }, [functions, services]);

  // Función para emparejar automáticamente funciones y servicios similares
  const autoMatch = () => {
    const matchedPairs = [];
    const usedServices = new Set();

    functions.forEach((func) => {
      const cleanedFuncName = cleanText(func.name);
      const cleanedFuncDesc = cleanText(func.description || "");

      const serviceMatches = services
        .map(service => {
          const cleanedServiceName = cleanText(service.name);
          const cleanedServiceDesc = cleanText(service.description || "");

          return {
            service,
            nameSim: stringSimilarity.compareTwoStrings(cleanedFuncName, cleanedServiceName),
            descSim: stringSimilarity.compareTwoStrings(cleanedFuncDesc, cleanedServiceDesc),
            areaSim: stringSimilarity.compareTwoStrings(cleanText(func.area || ""), cleanText(service.area || "")) // Comparación opcional de área
          };
        })
        .map(match => ({
          ...match,
          totalSim: (match.nameSim * 0.5) + (match.descSim * 0.4) + (match.areaSim * 0.1) // Ajustado para incluir áreas
        }))
        .filter(match => match.totalSim >= 0.6) // 🔥 Umbral reducido a 60%
        .sort((a, b) => b.totalSim - a.totalSim); // Ordenar por mayor similitud

      if (serviceMatches.length > 0 && !usedServices.has(serviceMatches[0].service._id)) {
        matchedPairs.push({
          funcId: func._id,
          serviceId: serviceMatches[0].service._id,
          similarity: serviceMatches[0].totalSim
        });
        usedServices.add(serviceMatches[0].service._id);
      }
    });

    setMatches(matchedPairs);
  };

  // Encontrar funciones y servicios emparejados
  const matchedItems = matches.map((match) => {
    const func = functions.find(f => f._id === match.funcId);
    const service = services.find(s => s._id === match.serviceId);
    return func && service ? { func, service, similarity: match.similarity } : null;
  }).filter(item => item !== null);

  // Separar las funciones y servicios no emparejados
  const matchedFunctionIds = new Set(matchedItems.map(m => m.func._id));
  const matchedServiceIds = new Set(matchedItems.map(m => m.service._id));

  const unmatchedFunctions = functions.filter(f => !matchedFunctionIds.has(f._id));
  const unmatchedServices = services.filter(s => !matchedServiceIds.has(s._id));

  // Definir áreas únicas después de calcular las funciones únicas
  const uniqueAreasSEDESA = [...new Set(unmatchedFunctions.map(f => f.area))];
  const uniqueAreasSSPCDMX = [...new Set(unmatchedServices.map(s => s.area))];

  // Aplicar filtros en funciones únicas de SEDESA
  const filteredFunctions = unmatchedFunctions.filter((func) =>
    func.name.toLowerCase().includes(searchTermSEDESA) &&
    (selectedAreaSEDESA === "" || func.area === selectedAreaSEDESA)
  );

  // Aplicar filtros en funciones únicas de SSPCDMX
  const filteredServices = unmatchedServices.filter((service) =>
    service.name.toLowerCase().includes(searchTermSSPCDMX) &&
    (selectedAreaSSPCDMX === "" || service.area === selectedAreaSSPCDMX)
  );

  return (
    <Container className="mt-5">
      <h2 className="text-center fw-bold mb-4">🔍 Duplicidades Encontradas</h2>

      <div style={{ maxHeight: "300px", overflowY: "auto" }} className="mb-4">
        {matchedItems.length > 0 ? (
          <Row className="justify-content-center">
            {matchedItems.map((match, index) => (
              <Col md={6} key={index} className="mb-3">
                <Card className="shadow-lg border-primary">
                  <Card.Body className="text-center">
                    <h5 className="fw-bold text-primary">
                      <Badge bg="primary" className="me-2">SEDESA</Badge>
                      {match.func.name}
                    </h5>
                    <p className="text-muted">{match.func.description}</p>
                    <Badge bg="info" className="mt-2">{match.func.area}</Badge>
                    <h5 className="fw-bold text-success">
                      <Badge bg="success" className="me-2">SSPCDMX</Badge>
                      {match.service.name}
                    </h5>
                    <p className="text-muted">{match.service.description}</p>
                    <Badge bg="info" className="mt-2">{match.service.area}</Badge>
                    <p className="mt-2 text-muted">🔹 Similitud: {(match.similarity * 100).toFixed(2)}%</p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p className="text-center text-muted">No hay empates aún.</p>
        )}
      </div>

      {/* Sección de funciones y servicios no emparejados con Scroll y Filtros */}
      <Row className="mt-4 mb-5">
        <Col md={6}>
          <Card className="shadow">
            <Card.Body>
              <Card.Title className="text-center text-danger fw-bold">⚠️ Funciones de SEDESA Únicas</Card.Title>
              <Filters setSearchTerm={setSearchTermSEDESA} setSelectedArea={setSelectedAreaSEDESA} areas={uniqueAreasSEDESA} />
              <div style={{ maxHeight: "250px", overflowY: "auto", paddingRight: "10px" }}>
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
              <div style={{ maxHeight: "250px", overflowY: "auto", paddingRight: "10px" }}>
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

export default MatchFunctionsServices;
