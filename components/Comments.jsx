import { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import axios from "axios";
import { Form, Button, ListGroup, Spinner, InputGroup } from "react-bootstrap";

const API_URL = import.meta.env.VITE_API_URL;

function Comments({ itemId }) {
  const [comentario, setComentario] = useState("");
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const { user } = useSelector((state) => state.auth);
  useEffect(() => {
    fetchComentarios();
  }, []);

  const fetchComentarios = async () => {
    try {
      const { data } = await axios.get(`${API_URL}comments/${itemId}`);
      setComentarios(data);
    } catch (error) {
      console.error("Error al obtener comentarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comentario.trim()) return;

    if (!user) {
      alert("Debes iniciar sesión para comentar.");
      return;
    }

    try {
      const { data } = await axios.post(`${API_URL}comments/`, {
        comentario,
        itemId,
        autor: user?.name || user?.username || "Usuario"
      });
      setComentarios([data, ...comentarios]);
      setComentario("");
    } catch (error) {
      console.error("Error al guardar comentario:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}comments/${id}`);
      setComentarios(comentarios.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
    }
  };

  const handleEdit = (id, currentComment) => {
    setEditingId(id);
    setEditedComment(currentComment);
  };

  const handleUpdate = async (id) => {
    try {
      const { data } = await axios.patch(`${API_URL}comments/${id}`, {
        comentario: editedComment
      });
      setComentarios(comentarios.map((c) => (c._id === id ? data : c)));
      setEditingId(null);
      setEditedComment("");
    } catch (error) {
      console.error("Error al actualizar comentario:", error);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: "numeric", 
      month: "short", 
      day: "numeric", 
      hour: "2-digit", 
      minute: "2-digit",
      second: "2-digit" 
    };
    return new Date(dateString).toLocaleString("es-MX", options);
  };

  return (
    <div className="mt-3">
      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Escribe un comentario..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        </Form.Group>
        <Button type="submit" variant="primary" size="sm" className="mt-2">
          Guardar comentario
        </Button>
      </Form>

      <div className="mt-3">
        {loading ? (
          <Spinner animation="border" size="sm" />
        ) : (
          <ListGroup>
            {comentarios.map((c) => (
              <ListGroup.Item key={c._id} className="d-flex justify-content-between align-items-start">
                <div style={{ flex: 1 }}>
                  <strong>{c.autor}:</strong>{" "}
                  {editingId === c._id ? (
                    <InputGroup>
                      <Form.Control
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        size="sm"
                      />
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleUpdate(c._id)}
                      >
                        Guardar
                      </Button>
                    </InputGroup>
                  ) : (
                    <>
                      {c.comentario}
                      <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                        {formatDate(c.updatedAt)}
                      </div>
                    </>
                  )}
                </div>
                <div className="ms-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleEdit(c._id, c.comentario)}
                    className="me-1"
                  >
                    ✏️
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(c._id)}
                  >
                    🗑️
                  </Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </div>
    </div>
  );
}

export default Comments;
