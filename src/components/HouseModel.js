import React, { forwardRef, useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber'; // useThree remains here
import { useGLTF } from '@react-three/drei'; // useGLTF is imported from here
import * as THREE from 'three';

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
      isDarkMode, // Prop received from parent
    },
    ref
  ) => {
    // Destructure scene from useThree and rename it to avoid conflict
    const { raycaster, camera, size, scene: threeScene } = useThree();
    const { scene: gltfScene } = useGLTF("/models/mapHouse.glb"); // Scene from GLTF model
    const [hoveredPart, setHoveredPart] = useState(null);
    const [focusedLabel, setFocusedLabel] = useState(null);

    useEffect(() => {
      raycaster.firstHitOnly = true;
      raycaster.params.Points.threshold = 0.5;
      raycaster.params.Line.threshold = 0.5;
      raycaster.params.Sprite.threshold = 0.5;
    }, [raycaster]);

    // Effect to update the background based on isDarkMode
    useEffect(() => {
      if (isDarkMode) {
        threeScene.background = new THREE.Color('#222222'); // Dark background
        // Optional: Adjust lighting for dark mode
        // if (threeScene.environment) threeScene.environment.intensity = 0.5;
      } else {
        threeScene.background = new THREE.Color('#ffffff'); // Light background
        // Optional: Reset lighting for light mode
        // if (threeScene.environment) threeScene.environment.intensity = 1;
      }
    }, [isDarkMode, threeScene]); // Depend on isDarkMode and the actual THREE scene

    // Clone the GLTF scene to avoid modifying the original cache
    const clonedGltfScene = gltfScene.clone();

    // Return the cloned GLTF scene object to be rendered
    return <primitive object={clonedGltfScene} dispose={null} ref={ref} />;
  }
);

export default HouseModel;
