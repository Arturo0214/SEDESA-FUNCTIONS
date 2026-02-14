import { useEffect, useState, useMemo, useRef } from "react";
import { Card, Button, Badge, Row, Col, Pagination, Container } from "react-bootstrap";
import Filters from "./Filters";

const API_URL = import.meta.env.VITE_API_URL;

function FunctionList() {
  const [functions, setFunctions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const paginationRef = useRef(null);

  useEffect(() => {
    fetchFunctions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedArea]);

  useEffect(() => {
    if (paginationRef.current) {
      paginationRef.current.scrollLeft = 0;
    }
  }, [currentPage]);

  const fetchFunctions = async () => {
    try {
      const response = await fetch(`${API_URL}functions`);
      const data = await response.json();
      setFunctions(data);
    } catch (error) {
      console.error("Error fetching functions:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}functions/${id}`, { method: "DELETE" });
      fetchFunctions();
    } catch (error) {
      console.error("Error deleting function:", error);
    }
  };

  const handleEdit = (func) => {
    console.log("Editar:", func);
  };

  const uniqueAreas = useMemo(() => [...new Set(functions.map((func) => func.area))], [functions]);

  const filteredFunctions = useMemo(() => {
    return functions.filter((func) => {
      return (
        func.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedArea === "" || func.area === selectedArea)
      );
    });
  }, [functions, searchTerm, selectedArea]);

  const totalPages = Math.ceil(filteredFunctions.length / itemsPerPage);
  const paginatedItems = filteredFunctions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <Container className="mt-1 px-3">
      <h2 className="text-center fw-bold mb-4">📌 Funciones de SEDESA</h2>

      {/* Filtros sticky */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          backgroundColor: "white",
          paddingBottom: "1rem",
          paddingTop: "0.5rem"
        }}
      >
        <Filters setSearchTerm={setSearchTerm} setSelectedArea={setSelectedArea} areas={uniqueAreas} />
      </div>

      {/* Contenedor con scroll y paginación sticky */}
      <div style={{ maxHeight: "550px", overflowY: "auto", position: "relative" }}>
        <Row className="g-2 mt-2">
          {paginatedItems.map((func) => (
            <Col key={func._id} xs={12} md={6} lg={4} className="mb-3">
              <Card className="function-card">
                <Card.Body className="d-flex flex-column">
                  <h6 className="fw-bold text-primary">{func.name}</h6>
                  <p className="text-muted small flex-grow-1">{func.description}</p>
                  <Badge bg="info">{func.area}</Badge>

                  <div className="mt-3 d-flex justify-content-end gap-2">
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

                <small className="text-muted ms-2">Total: {totalPages} páginas</small>
              </Col>
            </Row>
          </div>
        )}
      </div>
    </Container>
  );
}

export default FunctionList;