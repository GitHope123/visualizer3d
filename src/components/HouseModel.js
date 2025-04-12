import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
} from "react";
import { useGLTF, useCursor, Text, Billboard, Html } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

const HouseModel = forwardRef(
  (
    {
      onPartSelect,
      onResetSelection,
      selectedParts = [],
      registeredParts = [],
      viewMode = "default",
      selectionColor = "#ff0000",
      hoverColor = "#00ff00",
      showLabels = true,
      labelSettings = {
        fontSize: 0.15,
        color: "#2d3748",
        outlineColor: "#ffffff",
        offsetY: 0.3,
        alwaysVisible: true,
        showTextPanel: true,
        panelBackground: "#ffffff",
        panelOpacity: 0.8,
      },
    },
    ref
  ) => {
    const { scene: originalScene } = useGLTF("/models/mapHouse.glb");
    const { raycaster, camera, size } = useThree();
    const [hoveredPart, setHoveredPart] = useState(null);
    const [focusedLabel, setFocusedLabel] = useState(null);

    useEffect(() => {
      raycaster.firstHitOnly = true;
      raycaster.params.Points.threshold = 0.5;
      raycaster.params.Line.threshold = 0.5;
      raycaster.params.Sprite.threshold = 0.5;
    }, [raycaster]);

    useCursor(hoveredPart !== null);

    const clonedScene = useMemo(() => {
      const clone = originalScene.clone();
      clone.traverse((child) => {
        if (child.isMesh) {
          child.userData = {
            originalMaterial: child.material.clone(),
            isSelected: false,
            originalColor: child.material.color.clone(),
            originalWireframe: child.material.wireframe,
            worldPosition: new THREE.Vector3(),
          };
          child.castShadow = true;
          child.receiveShadow = true;
          child.material.wireframe = viewMode === "wireframe";
        }
      });
      return clone;
    }, [originalScene, viewMode]);

    const handleClick = useCallback(
      (event) => {
        event.stopPropagation();
        raycaster.setFromCamera(event.pointer, camera);
        const intersects = raycaster.intersectObject(clonedScene, true);

        if (intersects.length > 0) {
          const firstIntersect = intersects[0];
          const clickedObject = firstIntersect.object;

          if (clickedObject.isMesh && clickedObject.name) {
            const worldPosition = firstIntersect.point.clone();

            console.log("Selected position:", {
              x: worldPosition.x.toFixed(2),
              y: worldPosition.y.toFixed(2),
              z: worldPosition.z.toFixed(2),
            });

            onPartSelect?.(clickedObject.name, [
              parseFloat(worldPosition.x.toFixed(2)),
              parseFloat(worldPosition.y.toFixed(2)),
              parseFloat(worldPosition.z.toFixed(2)),
            ]);
          }
        }
      },
      [camera, clonedScene, onPartSelect, raycaster]
    );

    const handlePointerOver = useCallback(
      (event) => {
        event.stopPropagation();
        const object = event.object;
        if (
          object.isMesh &&
          object.name &&
          !selectedParts.includes(object.name)
        ) {
          setHoveredPart(object.name);
          object.material.color.set(hoverColor);
          setFocusedLabel(object.name);
        }
      },
      [selectedParts, hoverColor]
    );

    const handlePointerOut = useCallback(
      (event) => {
        event.stopPropagation();
        const object = event.object;
        if (
          object.isMesh &&
          object.name &&
          !selectedParts.includes(object.name)
        ) {
          setHoveredPart(null);
          object.material.color.copy(object.userData.originalColor);
          setFocusedLabel(null);
        }
      },
      [selectedParts]
    );

    const EnhancedLabel = ({ part }) => {
      const { position, customName, originalName } = part;
      const separation = 2.5;
      const direction = new THREE.Vector3(...position)
        .normalize()
        .multiplyScalar(separation);
      const labelPosition = new THREE.Vector3(...position).add(direction);

      // Create proper line geometry for raycasting
      const lineGeometry = useMemo(() => {
        const points = [new THREE.Vector3(...position), labelPosition];
        return new THREE.BufferGeometry().setFromPoints(points);
      }, [position, labelPosition]);

      return (
        <group>
          <line geometry={lineGeometry}>
            <lineBasicMaterial
              color="#00a8ff" // Azul moderno y vibrante
              linewidth={3} // Aumenté un poco el grosor para mejor visibilidad
              transparent={true}
              opacity={0.9} // Aumenté la opacidad para que se vea más sólido
            />
          </line>

          <group position={labelPosition.toArray()}>
            <Billboard>
              <Text
                fontSize={0.35}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.01}
                outlineColor="#000000"
                depthTest={false}
              ></Text>
            </Billboard>
          </group>

          {labelSettings.showTextPanel && (
            <Html center position={labelPosition.toArray()}>
            <div
              style={{
                background: "linear-gradient(135deg, rgba(223, 223, 223, 0.5) 0%, rgba(147, 188, 249, 0.4) 100%)", // Gradiente más suave y uniforme
                backdropFilter: "blur(18px)", // Un poco más de difuminado para dar más contraste
                WebkitBackdropFilter: "blur(18px)",
                padding: "14px 18px", // Un poco más de padding para mayor espacio interior
                borderRadius: "8px", // Bordes más suaves y redondeados
                border: "2px solid rgba(6, 68, 183, 0.9)", // Borde más intenso para resaltar
                boxShadow: "0 8px 20px rgba(248, 247, 247, 0.2)", // Sombra más prominente para dar más profundidad
                fontSize: "17px", // Un tamaño de fuente ligeramente mayor
                maxWidth: "260px", // Un poco más de ancho para acomodar mejor el texto
                color: "rgb(0, 89, 255)", // Color azul del texto más notorio
                textShadow: "0 2px 6px rgba(138, 138, 138, 0.4)", // Sombra del texto más fuerte para mejor legibilidad
                fontWeight: "500", // Un poco más de peso para el texto
                letterSpacing: "0.8px", // Espaciado de letras más amplio para un look más limpio
                transition: "all 0.3s ease", // Transición suave
              }}
            >
              {customName || originalName}
            </div>
          </Html>
          
          )}
        </group>
      );
    };

    return (
      <group
        onClick={handleClick}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerMissed={onResetSelection}
      >
        <primitive object={clonedScene} dispose={null} />

        {showLabels &&
          registeredParts.map((part) => (
            <EnhancedLabel key={part.id} part={part} />
          ))}
      </group>
    );
  }
);

HouseModel.displayName = "HouseModel";

export default HouseModel;
