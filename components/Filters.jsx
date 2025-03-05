import { useState } from "react";
import { Form } from "react-bootstrap";

function Filters({ setSearchTerm, setSelectedArea, areas }) {
  return (
    <div className="mb-3">
      {/* Buscador */}
      <Form.Control
        type="text"
        placeholder="🔍 Buscar..."
        onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        className="mb-2"
      />

      {/* Filtro por Área */}
      <Form.Select onChange={(e) => setSelectedArea(e.target.value)} className="mb-2">
        <option value="">Todas las Áreas</option>
        {areas.map((area, index) => (
          <option key={index} value={area}>
            {area}
          </option>
        ))}
      </Form.Select>
    </div>
  );
}

export default Filters;
