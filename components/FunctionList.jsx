import { useEffect, useState, useMemo, useRef } from "react";
import { Card, Button, Badge, Row, Col, Pagination, Container } from "react-bootstrap";
import { Search, Filter, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Filters from "./Filters";

const API_URL = import.meta.env.VITE_API_URL;

function FunctionList() {
  const [functions, setFunctions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    fetchFunctions();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedArea]);

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

  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let number = 1; number <= totalPages; number++) {
        items.push(
          <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
            {number}
          </Pagination.Item>
        );
      }
    } else {
      items.push(
        <Pagination.Item key={1} active={1 === currentPage} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );

      if (currentPage > 3) {
        items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
      }

      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        endPage = 4;
      }
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }

      for (let number = startPage; number <= endPage; number++) {
        items.push(
          <Pagination.Item key={number} active={number === currentPage} onClick={() => handlePageChange(number)}>
            {number}
          </Pagination.Item>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
      }

      items.push(
        <Pagination.Item key={totalPages} active={totalPages === currentPage} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }
    return items;
  };

  return (
    <Container fluid className="px-0">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
          <span className="text-primary">📌</span> Funciones de SEDESA
        </h2>
        <Badge bg="light" text="dark" className="border px-3 py-2 fs-6">
          Total: {filteredFunctions.length}
        </Badge>
      </div>

      <div className="bg-white p-3 rounded-3 shadow-sm border mb-4">
        <Filters setSearchTerm={setSearchTerm} setSelectedArea={setSelectedArea} areas={uniqueAreas} />
      </div>

      <Row className="g-4">
        {paginatedItems.map((func) => (
          <Col key={func._id} xs={12} md={6} lg={4} xl={4}>
            <Card className="function-card h-100 border-0" style={{ minHeight: '320px' }}>
              <Card.Body className="d-flex flex-column h-100 p-4">
                <div className="mb-3">
                  <Badge
                    bg="primary"
                    className="bg-opacity-10 text-primary px-3 py-2 rounded-3 fw-semibold border border-primary border-opacity-25 w-100 text-wrap text-start lh-sm"
                  >
                    {func.area}
                  </Badge>
                </div>

                <div className="mb-3" style={{ minHeight: '60px' }}>
                  <Card.Title
                    className="fw-bold text-dark m-0 fs-5 lh-sm"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {func.name}
                  </Card.Title>
                </div>

                <div className="flex-grow-1 mb-4 position-relative">
                  <Card.Text className="text-secondary small overflow-auto custom-scrollbar" style={{ maxHeight: '120px', paddingRight: '5px' }}>
                    {func.description}
                  </Card.Text>
                </div>

                <div className="mt-auto d-flex justify-content-end gap-2 pt-3 border-top w-100">
                  <Button variant="outline-warning" size="sm" className="d-flex align-items-center gap-1 px-3" onClick={() => handleEdit(func)}>
                    <Pencil size={14} /> Editar
                  </Button>
                  <Button variant="outline-danger" size="sm" className="d-flex align-items-center gap-1 px-3" onClick={() => handleDelete(func._id)}>
                    <Trash2 size={14} /> Eliminar
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {totalPages > 1 && (
        <div className="mt-5 d-flex justify-content-center">
          <Pagination className="shadow-sm rounded-pill overflow-hidden">
            <Pagination.Prev
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-0"
            >
              <ChevronLeft size={18} />
            </Pagination.Prev>

            {renderPaginationItems()}

            <Pagination.Next
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-0"
            >
              <ChevronRight size={18} />
            </Pagination.Next>
          </Pagination>
        </div>
      )}
    </Container>
  );
}

export default FunctionList;