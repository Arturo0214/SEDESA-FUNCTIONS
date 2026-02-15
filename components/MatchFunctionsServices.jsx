import { useState, useEffect, useMemo, useRef } from "react";
import { Container, Row, Col, Form, Pagination, Table, Badge, ProgressBar, Button, Collapse, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Search, ChevronDown, ChevronRight, ChevronLeft, ArrowUpDown, Eye } from "lucide-react";
import Comments from "./Comments";

const API_URL = import.meta.env.VITE_API_URL;

function MatchFunctionsServices() {
  const [matchedItems, setMatchedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [similarityFilter, setSimilarityFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const itemsPerPage = 15; // Increased for table view

  useEffect(() => {
    fetch(`${API_URL}matches`)
      .then((res) => res.json())
      .then(setMatchedItems)
      .catch((err) => console.error(err));
  }, []);

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

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const getSimColor = (val) => {
    if (val >= 80) return "danger";
    if (val >= 60) return "warning";
    return "success";
  };

  useEffect(() => setCurrentPage(1), [searchTerm, selectedArea, similarityFilter, sortOrder]);

  if (matchedItems.length === 0) {
    return (
      <Container className="text-center mt-5 p-5">
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <p className="text-muted fw-semibold">Cargando análisis...</p>
      </Container>
    );
  }

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
        <div>
          <h2 className="fw-bold text-dark m-0 d-flex align-items-center gap-2">
            <span className="text-primary">📊</span> Análisis de Duplicidades
          </h2>
          <p className="text-muted small m-0">Compara y detecta redundancias entre organismos</p>
        </div>
        <Badge bg="light" text="dark" className="border px-3 py-2 fs-6 shadow-sm">
          {filteredItems.length} coincidencias
        </Badge>
      </div>

      {/* Barra de Herramientas Compacta */}
      <div className="bg-white p-3 rounded-3 shadow-sm border mb-4">
        <Row className="g-2 align-items-center">
          <Col md={4}>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white border-end-0 text-muted"><Search size={14} /></span>
              <Form.Control
                placeholder="Buscar por nombre..."
                onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
                className="border-start-0 shadow-none"
              />
            </div>
          </Col>
          <Col md={3}>
            <Form.Select size="sm" onChange={(e) => setSelectedArea(e.target.value)} className="shadow-none">
              <option value="">Todas las áreas</option>
              {uniqueAreas.map((area, i) => <option key={i} value={area}>{area}</option>)}
            </Form.Select>
          </Col>
          <Col md={3}>
            <Form.Select size="sm" value={similarityFilter} onChange={(e) => setSimilarityFilter(e.target.value)} className="shadow-none">
              <option value="">Cualquier similitud</option>
              <option value="alta">🔴 Crítica (80%+)</option>
              <option value="media">🟡 Media (60–79%)</option>
              <option value="baja">🟢 Baja (&lt;60%)</option>
            </Form.Select>
          </Col>
          <Col md={2}>
            <Form.Select size="sm" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="shadow-none">
              <option value="desc">Mayor similitud</option>
              <option value="asc">Menor similitud</option>
            </Form.Select>
          </Col>
        </Row>
      </div>

      <div className="bg-white shadow-sm rounded-3 border overflow-hidden">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th style={{ width: '40px' }}></th>
              <th style={{ width: '15%' }} className="text-muted small fw-bold text-uppercase">Área</th>
              <th style={{ width: '30%' }} className="text-muted small fw-bold text-uppercase">Func. SEDESA</th>
              <th style={{ width: '5%' }} className="text-center"></th> {/* Flecha */}
              <th style={{ width: '30%' }} className="text-muted small fw-bold text-uppercase">Serv. SSPCDMX</th>
              <th style={{ width: '20%' }} className="text-muted small fw-bold text-uppercase">Similitud</th>
            </tr>
          </thead>
          <tbody>
            {paginatedItems.map((match, index) => {
              const simPercent = (match.similarity * 100).toFixed(1);
              const isExpanded = expandedRows.has(index);
              const color = getSimColor(simPercent);

              return (
                <>
                  <tr key={index} className={isExpanded ? "bg-light" : ""}>
                    <td className="text-center">
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-muted"
                        onClick={() => toggleRow(index)}
                      >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </Button>
                    </td>
                    <td>
                      <Badge bg="light" text="dark" className="border fw-normal text-start text-wrap" style={{ maxWidth: '150px' }}>
                        {match.func.area}
                      </Badge>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark d-block text-truncate" style={{ maxWidth: '250px' }} title={match.func.name}>
                        {match.func.name}
                      </span>
                    </td>
                    <td className="text-center text-muted">
                      <ArrowUpDown size={14} className="opacity-50" />
                    </td>
                    <td>
                      <span className="fw-semibold text-dark d-block text-truncate" style={{ maxWidth: '250px' }} title={match.service.name}>
                        {match.service.name}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="flex-grow-1">
                          <ProgressBar
                            now={simPercent}
                            variant={color}
                            style={{ height: '6px' }}
                            className="rounded-pill"
                          />
                        </div>
                        <span className={`small fw-bold text-${color}`} style={{ minWidth: '40px' }}>
                          {Math.round(simPercent)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${index}-details`} className="bg-light">
                      <td></td>
                      <td colSpan="5">
                        <div className="p-3 border rounded-3 bg-white mb-3 shadow-sm">
                          <Row>
                            <Col md={6} className="border-end">
                              <h6 className="text-primary fw-bold small mb-2">Detalle SEDESA</h6>
                              <p className="small text-muted mb-0">{match.func.description}</p>
                            </Col>
                            <Col md={6}>
                              <h6 className="text-success fw-bold small mb-2">Detalle SSPCDMX</h6>
                              <p className="small text-muted mb-0">{match.service.description}</p>
                            </Col>
                          </Row>
                          <div className="mt-3 pt-3 border-top">
                            <Comments itemId={`${match.func._id}-${match.service._id}`} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 d-flex justify-content-center">
          <Pagination size="sm" className="m-0 shadow-sm">
            <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
            {renderPaginationItems()}
            <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
          </Pagination>
        </div>
      )}
    </Container>
  );
}

export default MatchFunctionsServices;
