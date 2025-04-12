import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Bounds } from "@react-three/drei";
import {
  Container,
  Row,
  Col,
  Button,
  Badge,
  Modal,
  Form,
  Toast,
} from "react-bootstrap";
import HouseModel from "./components/HouseModel";
import PanelInfo from "./components/PanelInfo";
import { debounce } from "lodash";

// Constants
const DEFAULT_VIEW_MODE = "default";
const DEFAULT_CAMERA = { position: [10, 10, 10], fov: 50 };
const LABEL_COLORS = ["#2d3748", "#4a5568", "#718096", "#90cdf4", "#63b3ed"];

export default function App() {
  // State management
  const [selectedPart, setSelectedPart] = useState(null);
  const [selectedParts, setSelectedParts] = useState([]);
  const [registeredParts, setRegisteredParts] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [partName, setPartName] = useState("");
  const [partPosition, setPartPosition] = useState(null);
  const [viewMode, setViewMode] = useState(DEFAULT_VIEW_MODE);
  const [showGrid, setShowGrid] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    variant: "success",
  });
  const [selectionColor, setSelectionColor] = useState("#ff0000");
  const [hoverColor, setHoverColor] = useState("#00ff00");
  const [showLabels, setShowLabels] = useState(true);
  const [labelSettings, setLabelSettings] = useState({
    fontSize: 0.18,
    color: "#2d3748",
    outlineColor: "#ffffff",
    offsetY: 0.4,
    alwaysVisible: false,
  });

  // Refs
  const controlsRef = useRef();
  const boundsRef = useRef();
  const notificationTimeoutRef = useRef();

  // Load saved parts from localStorage
  useEffect(() => {
    const loadParts = () => {
      try {
        const savedParts = localStorage.getItem("registeredParts");
        const savedLabelSettings = localStorage.getItem("labelSettings");
        if (savedParts) {
          const parsedParts = JSON.parse(savedParts);
          if (Array.isArray(parsedParts)) {
            setRegisteredParts(parsedParts);
          }
        }
        if (savedLabelSettings) {
          setLabelSettings(JSON.parse(savedLabelSettings));
        }
      } catch (error) {
        showNotification("Error loading saved data", "danger");
        console.error("Error loading data:", error);
      }
    };
    loadParts();
  }, []);

  // Save data to localStorage with debouncing
  const saveData = useMemo(
    () =>
      debounce((parts, settings) => {
        try {
          localStorage.setItem("registeredParts", JSON.stringify(parts));
          localStorage.setItem("labelSettings", JSON.stringify(settings));
        } catch (error) {
          console.error("Error saving data:", error);
        }
      }, 500),
    []
  );

  useEffect(() => {
    saveData(registeredParts, labelSettings);
    return () => saveData.cancel();
  }, [registeredParts, labelSettings, saveData]);

  // Handle part selection
  const handlePartSelect = useCallback((partName, position) => {
    setSelectedParts((prev) => {
      const newSelection = prev.includes(partName)
        ? prev.filter((name) => name !== partName)
        : [...prev, partName];
      setSelectedPart(newSelection.length > 0 ? partName : null);
      return newSelection;
    });

    if (position) setPartPosition(position);
  }, []);

  // Reset selection
  const handleResetSelection = useCallback(() => {
    setSelectedParts([]);
    setSelectedPart(null);
  }, []);

  // Show notification
  const showNotification = useCallback(
    (message, variant = "success", duration = 3000) => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }

      setNotification({ show: true, message, variant });

      notificationTimeoutRef.current = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, duration);
    },
    []
  );

  // Register new part
  const registerPart = useCallback(() => {
    if (!selectedPart || !partName.trim() || !partPosition) {
      showNotification("Please select a part and provide a name", "warning");
      return;
    }

    const newPart = {
      id: Date.now(),
      originalName: selectedPart,
      customName: partName.trim(),
      position: partPosition,
      color: LABEL_COLORS[registeredParts.length % LABEL_COLORS.length],
      createdAt: new Date().toISOString(),
    };

    setRegisteredParts((prev) => [...prev, newPart]);
    setPartName("");
    setShowRegisterModal(false);
    showNotification("Part registered successfully");
  }, [
    selectedPart,
    partName,
    partPosition,
    registeredParts.length,
    showNotification,
  ]);

  // Remove registered part
  const removeRegisteredPart = useCallback(
    (id) => {
      setRegisteredParts((prev) => prev.filter((part) => part.id !== id));
      showNotification("Part removed", "info");
    },
    [showNotification]
  );

  // Fit view to selection
  const fitViewToSelection = useCallback(() => {
    if (boundsRef.current && selectedParts.length > 0) {
      boundsRef.current.refresh().fit();
    }
  }, [selectedParts]);

  // Reset camera view
  const resetView = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Container fluid className="vh-100 d-flex flex-column p-0">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-primary py-2">
        <Container fluid>
          <span className="navbar-brand d-flex align-items-center gap-2">
            <i className="bi bi-house-door-fill"></i>
            <span>3D House Visualizer</span>
          </span>
          <div className="d-flex align-items-center gap-3">
            <Badge bg="light" text="dark" pill className="px-3">
              Registered: {registeredParts.length}
            </Badge>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => setShowPartsModal(true)}
              disabled={selectedParts.length === 0}
              className="d-flex align-items-center"
            >
              <i className="bi bi-list-check me-2"></i>
              Selection ({selectedParts.length})
            </Button>
            <Button
              variant="outline-light"
              size="sm"
              onClick={() => setShowLabels(!showLabels)}
              className="d-flex align-items-center"
            >
              <i className={`bi bi-tag${showLabels ? "-fill" : ""} me-2`}></i>
              {showLabels ? "Hide" : "Show"} Labels
            </Button>
          </div>
        </Container>
      </nav>

      <Row className="flex-grow-1 m-0">
        {/* 3D View Panel */}
        <Col lg={9} className="p-0 position-relative">
          <Canvas camera={DEFAULT_CAMERA}>
            <Bounds ref={boundsRef} fit margin={1.2} observe>
              <ambientLight intensity={0.7} />
              <directionalLight
                position={[10, 10, 5]}
                intensity={1}
                castShadow
              />
              <HouseModel
                ref={boundsRef}
                onPartSelect={handlePartSelect}
                onResetSelection={handleResetSelection}
                selectedParts={selectedParts}
                registeredParts={registeredParts}
                viewMode={viewMode}
                selectionColor={selectionColor}
                hoverColor={hoverColor}
                showLabels={showLabels}
                labelSettings={{
                  fontSize: 0.18,
                  color: '#2d3748',
                  outlineColor: '#ffffff',
                  offsetY: 0.4,
                  alwaysVisible: false,
                  showTextPanel: true,
                  panelBackground: '#ffffff',
                  panelOpacity: 0.8
                }}
                showTextLabels={true} // Añade esta nueva propiedad
              />
            </Bounds>
            {/* que muestre las etiquetas registradas de las partes en una caja de texto en el plano */}
            <OrbitControls
              ref={controlsRef}
              makeDefault
              enableDamping
              dampingFactor={0.05}
            />
            <Environment preset="city" />
            {showGrid && <gridHelper args={[50, 50, "#666666", "#444444"]} />}
          </Canvas>
        </Col>

        {/* Information Panel */}
        <PanelInfo
          selectedPart={selectedPart}
          partPosition={partPosition}
          registeredParts={registeredParts}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          viewMode={viewMode}
          setViewMode={setViewMode}
          controlsRef={controlsRef}
          setShowRegisterModal={setShowRegisterModal}
          removeRegisteredPart={removeRegisteredPart}
          fitViewToSelection={fitViewToSelection}
          resetView={resetView}
          labelSettings={labelSettings}
          setLabelSettings={setLabelSettings}
        />
      </Row>

      {/* Notification Toast */}
      <Toast
        show={notification.show}
        onClose={() => setNotification((prev) => ({ ...prev, show: false }))}
        delay={3000}
        autohide
        className={`position-fixed bottom-0 end-0 m-3 bg-${notification.variant} text-white`}
      >
        <Toast.Body>
          <i
            className={`bi bi-${
              notification.variant === "success"
                ? "check-circle"
                : "exclamation-triangle"
            } me-2`}
          ></i>
          {notification.message}
        </Toast.Body>
      </Toast>

      {/* Register Part Modal */}
      <Modal
        show={showRegisterModal}
        onHide={() => setShowRegisterModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Register New Part</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Part Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter custom name"
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                autoFocus
              />
              <Form.Text className="text-muted">
                Selected part: {selectedPart}
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRegisterModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={registerPart}>
            Register Part
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Selected Parts Modal */}
      <Modal
        show={showPartsModal}
        onHide={() => setShowPartsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Selected Parts ({selectedParts.length})</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-wrap gap-2">
            {selectedParts.map((part, index) => (
              <Badge key={index} bg="primary" pill className="fs-6 p-2">
                {part}
              </Badge>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPartsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
