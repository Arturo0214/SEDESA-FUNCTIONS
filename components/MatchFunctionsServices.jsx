import { useState, useEffect, useMemo, useRef } from "react";
import { Card, Badge, Container, Row, Col, Form, Pagination } from "react-bootstrap";
import Comments from "./Comments";

function similarityBadge(similarity) {
  const percentage = similarity * 100;
  if (percentage >= 80) return <Badge bg="danger">🔴 Alta ({percentage.toFixed(2)}%)</Badge>;
  if (percentage >= 60) return <Badge bg="warning">🟡 Media ({percentage.toFixed(2)}%)</Badge>;
  return <Badge bg="success">🟢 Baja ({percentage.toFixed(2)}%)</Badge>;
}

function MatchFunctionsServices() {
  const [matchedItems, setMatchedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [similarityFilter, setSimilarityFilter] = useState(""); // 👈 nuevo filtro
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetch("https://water-clever-sage.glitch.me/matches")
      .then((res) => res.json())
      .then(setMatchedItems)
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => setCurrentPage(1), [searchTerm, selectedArea, similarityFilter, sortOrder]);

  const paginationRef = useRef(null);

  useEffect(() => {
    if (paginationRef.current) {
      paginationRef.current.scrollLeft = 0;
    }
  }, [currentPage, searchTerm, selectedArea, similarityFilter, sortOrder]);

  const uniqueAreas = useMemo(
    () => [...new Set(matchedItems.flatMap((item) => [item.func.area, item.service.area]))],
    [matchedItems]
  );

  const filteredItems = useMemo(() => {
    let items = matchedItems.filter((match) => {
      const searchMatch =
        searchTerm === "" ||
        match.func.name.toLowerCase().includes(searchTerm) ||
        match.service.name.toLowerCase().includes(searchTerm);

      const areaMatch =
        selectedArea === "" ||
        match.func.area === selectedArea ||
        match.service.area === selectedArea;

      const similarity = match.similarity * 100;
      const similarityMatch =
        similarityFilter === "" ||
        (similarityFilter === "alta" && similarity >= 80) ||
        (similarityFilter === "media" && similarity >= 60 && similarity < 80) ||
        (similarityFilter === "baja" && similarity < 60);

      return searchMatch && areaMatch && similarityMatch;
    });

    return items.sort((a, b) =>
      sortOrder === "asc" ? a.similarity - b.similarity : b.similarity - a.similarity
    );
  }, [matchedItems, searchTerm, selectedArea, similarityFilter, sortOrder]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (matchedItems.length === 0) {
    return (
      <Container className="text-center mt-5">
        <p>🌀 Cargando coincidencias...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-1 px-3">
      <h2 className="text-center fw-bold mb-4">🔍 Duplicidades Encontradas</h2>

      {/* Filtros */}
      <Row className="mb-3 g-2">
        <Col md={3}>
          <Form.Control
            placeholder="🔍 Buscar duplicidad..."
            onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          />
        </Col>
        <Col md={3}>
          <Form.Select onChange={(e) => setSelectedArea(e.target.value)}>
            <option value="">📌 Filtrar por área</option>
            {uniqueAreas.map((area, i) => (
              <option key={i} value={area}>
                {area}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={similarityFilter} onChange={(e) => setSimilarityFilter(e.target.value)}>
            <option value="">🎯 Filtrar por similitud</option>
            <option value="alta">🔴 Alta (80%+)</option>
            <option value="media">🟡 Media (60–79%)</option>
            <option value="baja">🟢 Baja (&lt;60%)</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">🔽 Mayor similitud</option>
            <option value="asc">🔼 Menor similitud</option>
          </Form.Select>
        </Col>
      </Row>

  {/* Contenedor con scroll para cards + sticky pagination */}
<div style={{ maxHeight: "520px", overflowY: "auto", position: "relative" }}>
  <Row className="justify-content-center">
    {paginatedItems.map((match, index) => (
      <Col xs={12} md={6} lg={4} key={index} className="mb-3">
        <Card className="shadow-sm border-primary h-100" style={{ padding: "10px", fontSize: "0.9rem" }}>
          <Card.Body className="text-center p-2 d-flex flex-column">
            <h6 className="fw-bold text-primary">
              <Badge bg="primary">SEDESA</Badge> {match.func.name}
            </h6>
            <p className="text-muted small flex-grow-1">{match.func.description}</p>
            <Badge bg="info">{match.func.area}</Badge>

            <h6 className="fw-bold text-success mt-3">
              <Badge bg="success">SSPCDMX</Badge> {match.service.name}
            </h6>
            <p className="text-muted small flex-grow-1">{match.service.description}</p>
            <Badge bg="info">{match.service.area}</Badge>

            <div className="mt-2">{similarityBadge(match.similarity)}</div>

            <Comments itemId={`${match.func._id}-${match.service._id}`} />
          </Card.Body>
        </Card>
      </Col>
    ))}
  </Row>

  {totalPages > 1 && (
  <div
    ref={paginationRef}
    style={{
      overflowX: "auto",
      whiteSpace: "nowrap",
      position: "sticky",
      bottom: 0,
      backgroundColor: "white",
      padding: "10px 0",
      zIndex: 10,
      borderTop: "1px solid #ccc"
    }}
  >
    <Row>
      <Col className="d-flex justify-content-center align-items-center gap-2 flex-wrap">
        <Pagination>
          <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />

          {(() => {
            const pagesToShow = 10;
            const startPage = Math.floor((currentPage - 1) / pagesToShow) * pagesToShow + 1;
            const endPage = Math.min(startPage + pagesToShow - 1, totalPages);

            const items = [];

            for (let i = startPage; i <= endPage; i++) {
              items.push(
                <Pagination.Item key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>
                  {i}
                </Pagination.Item>
              );
            }

            if (endPage < totalPages) {
              items.push(<Pagination.Ellipsis key="ellipsis" disabled />);
              items.push(
                <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </Pagination.Item>
              );
            }

            return items;
          })()}

          <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
        </Pagination>

        {/* Mostrar el total de páginas como texto */}
        <small className="text-muted ms-2">Total: {totalPages} páginas</small>
      </Col>
    </Row>
  </div>
)}
</div>
    </Container>
  );
}

export default MatchFunctionsServices;
