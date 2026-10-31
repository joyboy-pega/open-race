'use client';

import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/lib/game/store';
import { world } from '@/lib/game/sim/world';
import { renderPose, type Pose } from '@/lib/game/sim/interp';
import { surfaceHeight, surfaceGradeAngle, surfaceIndex } from '@/lib/game/track/surface';
import { track } from '@/lib/game/track';

const scratchPose: Pose = { x: 0, y: 0, a: 0 };

/**
 * High-performance virtual rear-view mirror for Open Race.
 *
 * Screen-fixed, wide panoramic rear-view mirror anchored at the top center of the viewport
 * between the Timing Tower and Lap Chip HUD panels.
 * Features:
 *   - Screen-space pixel locking: mathematically invariant to camera FOV changes, speed zoom, and shake
 *   - Ultra-crisp 1280x256 5:1 panoramic RenderTarget
 *   - Horizontally flipped optics (left is left, right is right)
 *   - Buddh GP chamfered corner language with aerodynamic carbon bevel
 *   - Active blind-spot warning chevrons on left and right borders
 *   - Distance reference tick lines
 *   - Keyboard shortcut 'V' to toggle
 */
export function RearViewMirror() {
  const { gl, scene, camera, size } = useThree();
  const showRearViewMirror = useGameStore((s) => s.settings.showRearViewMirror ?? true);
  const replayActive = useGameStore((s) => s.replayActive);

  // Keyboard shortcut: Press 'V' to toggle rear-view mirror
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyV' && !e.repeat && !(e.target instanceof HTMLInputElement)) {
        const cur = useGameStore.getState().settings.showRearViewMirror ?? true;
        const next = !cur;
        useGameStore.getState().setSettings({ showRearViewMirror: next });
        useGameStore.getState().pushToast({
          id: 'toast-mirror',
          type: 'info',
          title: 'REAR MIRROR',
          subtitle: next ? 'ON' : 'OFF',
          duration: 1.5,
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. Offscreen RenderTarget (1280x256, 5:1 panoramic aspect ratio)
  const renderTarget = useMemo(() => {
    const rt = new THREE.WebGLRenderTarget(1280, 256, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      depthBuffer: true,
      stencilBuffer: false,
    });
    return rt;
  }, []);

  // 2. Rearward Perspective Camera (wide 5:1 aspect ratio)
  const rearCamera = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(46, 1280 / 256, 0.4, 3000);
    return cam;
  }, []);

  // 3. Blind spot indicator materials
  const leftIndicatorMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0x222630, depthTest: false, depthWrite: false }),
    []
  );
  const rightIndicatorMat = useMemo(
    () => new THREE.MeshBasicMaterial({ color: 0x222630, depthTest: false, depthWrite: false }),
    []
  );

  // 4. Normalized 1x1 Mirror 3D Assembly (casing + chamfered glass + indicators + markings)
  const mirrorGroup = useMemo(() => {
    const group = new THREE.Group();
    group.renderOrder = 998;

    // Unit-sized base shape (W = 1.0, H = 1.0)
    const w2 = 0.5;
    const h2 = 0.5;
    const c = 0.08; // 8% bottom-corner chamfer matching Open Race polygon style

    const shape = new THREE.Shape();
    shape.moveTo(-w2, h2);
    shape.lineTo(w2, h2);
    shape.lineTo(w2, -h2 + c);
    shape.lineTo(w2 - c, -h2);
    shape.lineTo(-w2 + c, -h2);
    shape.lineTo(-w2, -h2 + c);
    shape.closePath();

    // Carbon Casing Background
    const casingGeom = new THREE.ShapeGeometry(shape);
    const casingMat = new THREE.MeshBasicMaterial({
      color: 0x090b0f,
      depthTest: false,
      depthWrite: false,
    });
    const casingMesh = new THREE.Mesh(casingGeom, casingMat);
    casingMesh.renderOrder = 998;
    group.add(casingMesh);

    // Bezel Accent Rim
    const rimPoints = shape.getPoints();
    const rimGeom = new THREE.BufferGeometry().setFromPoints(rimPoints);
    const rimMat = new THREE.LineBasicMaterial({
      color: 0x2a2f3d,
      depthTest: false,
      depthWrite: false,
    });
    const rimLine = new THREE.Line(rimGeom, rimMat);
    rimLine.renderOrder = 999;
    group.add(rimLine);

    // Top Mount Tab
    const tabGeom = new THREE.PlaneGeometry(0.12, 0.05);
    const tabMat = new THREE.MeshBasicMaterial({ color: 0x141820, depthTest: false, depthWrite: false });
    const tabMesh = new THREE.Mesh(tabGeom, tabMat);
    tabMesh.position.set(0, h2 + 0.025, 0);
    tabMesh.renderOrder = 998;
    group.add(tabMesh);

    // Mirror Glass Surface (occupies ~95% width, ~92% height)
    const glassW = 0.94;
    const glassH = 0.88;
    const glassGeom = new THREE.PlaneGeometry(glassW, glassH);

    // Horizontally flip UVs for authentic mirror reflection
    const uvAttr = glassGeom.attributes.uv;
    for (let i = 0; i < uvAttr.count; i++) {
      uvAttr.setX(i, 1 - uvAttr.getX(i));
    }
    uvAttr.needsUpdate = true;

    const glassMat = new THREE.MeshBasicMaterial({
      map: renderTarget.texture,
      toneMapped: false,
      depthTest: false,
      depthWrite: false,
    });
    const glassMesh = new THREE.Mesh(glassGeom, glassMat);
    glassMesh.position.set(0, -0.01, 0.001);
    glassMesh.renderOrder = 999;
    group.add(glassMesh);

    // Distance tick markers along bottom edge
    const tickMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      depthTest: false,
      depthWrite: false,
    });
    const ticksGeom = new THREE.BufferGeometry();
    const tickVerts: number[] = [];
    const tickX = [-glassW * 0.3, -glassW * 0.15, 0, glassW * 0.15, glassW * 0.3];
    const bY = -0.01 - glassH / 2;
    for (const tx of tickX) {
      tickVerts.push(tx, bY, 0.002, tx, bY + 0.08, 0.002);
    }
    ticksGeom.setAttribute('position', new THREE.Float32BufferAttribute(tickVerts, 3));
    const ticks = new THREE.LineSegments(ticksGeom, tickMat);
    ticks.renderOrder = 1000;
    group.add(ticks);

    // Blind Spot Warning Chevrons (LED indicator wedges on left and right borders)
    const chevronShape = new THREE.Shape();
    chevronShape.moveTo(0, 0.12);
    chevronShape.lineTo(0.04, 0);
    chevronShape.lineTo(0, -0.12);
    chevronShape.lineTo(-0.02, -0.09);
    chevronShape.lineTo(0.01, 0);
    chevronShape.lineTo(-0.02, 0.09);
    chevronShape.closePath();

    const chevronGeom = new THREE.ShapeGeometry(chevronShape);

    // Left Indicator (facing left: rotate 180 deg)
    const leftInd = new THREE.Mesh(chevronGeom, leftIndicatorMat);
    leftInd.position.set(-w2 + 0.024, -0.01, 0.002);
    leftInd.rotation.z = Math.PI;
    leftInd.renderOrder = 1000;
    group.add(leftInd);

    // Right Indicator (facing right)
    const rightInd = new THREE.Mesh(chevronGeom, rightIndicatorMat);
    rightInd.position.set(w2 - 0.024, -0.01, 0.002);
    rightInd.renderOrder = 1000;
    group.add(rightInd);

    return group;
  }, [renderTarget, leftIndicatorMat, rightIndicatorMat]);

  // Mount mirrorGroup to the 3D scene
  useEffect(() => {
    scene.add(mirrorGroup);
    return () => {
      scene.remove(mirrorGroup);
      renderTarget.dispose();
      leftIndicatorMat.dispose();
      rightIndicatorMat.dispose();
    };
  }, [scene, mirrorGroup, renderTarget, leftIndicatorMat, rightIndicatorMat]);

  // Frame loop: update rear camera, render to target, and position mirror mesh
  useFrame(() => {
    const isVisible =
      showRearViewMirror &&
      !replayActive &&
      world.phase === 'racing' &&
      !world.player?.ctrl.lookBack;

    if (!isVisible) {
      mirrorGroup.visible = false;
      return;
    }

    const player = world.player;
    if (!player) {
      mirrorGroup.visible = false;
      return;
    }

    // 1. Compute rear camera pose based on interpolated player car physics
    // 1 unit = 0.1 m. The car is ~50 units long, so rear wing sits at ~-24 units.
    renderPose(player, world.alpha, scratchPose);
    const carX = scratchPose.x;
    const carZ = scratchPose.y;
    const carA = scratchPose.a;

    const p = player.phys;
    const carY = p.idx !== undefined ? surfaceHeight(surfaceIndex(p.idx, carX, carZ), 0) : 0;
    const roadPitch = p.idx !== undefined ? surfaceGradeAngle(surfaceIndex(p.idx, carX, carZ)) : 0;
    const T = track.current;
    const trackYaw = p.idx !== undefined && T && T.ty ? Math.atan2(T.ty[p.idx], T.tx[p.idx]) : carA;
    const effRoadPitch = roadPitch * Math.cos(carA - trackYaw);

    const fx = Math.cos(carA);
    const fz = Math.sin(carA);

    // Camera mounted just behind the rear wing (28 units = 2.8m) at 13 units (1.3m) height
    const rearDist = 28;
    const camX = carX - fx * rearDist;
    const camZ = carZ - fz * rearDist;
    const camY = carY + 13;

    rearCamera.position.set(camX, camY, camZ);

    // Look backward with slight downward declination onto the road behind (500 units = 50m)
    const lookDist = 500;
    const targetX = camX - fx * lookDist;
    const targetZ = camZ - fz * lookDist;
    const lookTargetY = camY + (effRoadPitch - 0.02) * lookDist;
    rearCamera.lookAt(targetX, lookTargetY, targetZ);
    rearCamera.up.set(0, 1, 0);

    // 2. Offscreen render pass to rear-view RenderTarget
    mirrorGroup.visible = false;
    const prevTarget = gl.getRenderTarget();
    gl.setRenderTarget(renderTarget);
    gl.clear();
    gl.render(scene, rearCamera);
    gl.setRenderTarget(prevTarget);
    mirrorGroup.visible = true;

    // 3. Anchor mirror mesh to screen-fixed pixel coordinates
    // Mathematically invariant to camera FOV changes and speed zoom
    const cam = camera as THREE.PerspectiveCamera;
    const d = 1.5; // distance in front of optical center (> camera.near=1.0)
    const fovRad = THREE.MathUtils.degToRad(cam.fov || 65);
    const tanHalfFov = Math.tan(fovRad / 2);
    const aspect = cam.aspect || size.width / Math.max(1, size.height);

    // Frustum dimensions in world units at distance d
    const frustumH = 2.0 * d * tanHalfFov;
    const frustumW = frustumH * aspect;

    // Screen pixel to world conversion factors
    const pxToWorldY = frustumH / Math.max(1, size.height);
    const pxToWorldX = frustumW / Math.max(1, size.width);

    // Desired pixel size matching user's big fixed outline:
    // Fits cleanly in the space between the Timing Tower (left) and Lap Chip (right)
    const availableGap = Math.max(0, size.width - 540);
    const desiredPixelW = availableGap > 240
      ? Math.min(880, availableGap)
      : Math.min(380, size.width - 24);
    const desiredPixelH = Math.round(desiredPixelW / 5.3);

    const mirrorWorldW = desiredPixelW * pxToWorldX;
    const mirrorWorldH = desiredPixelH * pxToWorldY;

    // Fixed 10px top margin from the top edge of the screen
    const topOffsetPx = 10;
    const topMarginWorld = topOffsetPx * pxToWorldY;
    const mirrorCenterY = frustumH / 2 - topMarginWorld - mirrorWorldH / 2;

    mirrorGroup.position.copy(cam.position);
    mirrorGroup.quaternion.copy(cam.quaternion);
    mirrorGroup.translateZ(-d);
    mirrorGroup.translateY(mirrorCenterY);
    mirrorGroup.scale.set(mirrorWorldW, mirrorWorldH, 1);

    // 4. Update Blind-Spot Warning indicators
    let leftWarn = false;
    let rightWarn = false;
    const lx = -fz; // lateral left unit vector
    const lz = fx;

    for (let i = 0; i < world.cars.length; i++) {
      const other = world.cars[i];
      if (other.isPlayer) continue;
      const op = other.phys;
      const dx = op.x - carX;
      const dz = op.y - carZ;
      const lon = dx * fx + dz * fz; // forward > 0, behind < 0
      const lat = dx * lx + dz * lz; // left > 0, right < 0

      // Within trailing blind-spot zone (-28m to 0m behind: -280 to 0 units)
      if (lon < 0 && lon > -280) {
        if (lat > 12 && lat < 50) leftWarn = true;
        if (lat < -12 && lat > -50) rightWarn = true;
      }
    }

    leftIndicatorMat.color.setHex(leftWarn ? 0xffaa00 : 0x222630);
    rightIndicatorMat.color.setHex(rightWarn ? 0xffaa00 : 0x222630);
  });

  return null;
}
