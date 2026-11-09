'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { track } from '@/lib/game/track';
import { surfaceHeight } from '@/lib/game/track/surface';
import { getBanner } from '@/lib/game/visuals/textures';

/**
 * Creates a wedge ramp BufferGeometry of width `w`, height `h`, and length `l`.
 * Inclined from y=0 at z=0 up to y=h at z=l.
 */
function createRampGeometry(w: number, h: number, l: number): THREE.BufferGeometry {
  const hw = w / 2;
  // 6 vertices of the triangular prism
  // 0: front-left (0, 0, 0)
  // 1: front-right (w, 0, 0)
  // 2: back-left (0, h, l)
  // 3: back-right (w, h, l)
  // 4: base-back-left (0, 0, l)
  // 5: base-back-right (w, 0, l)
  const positions = new Float32Array([
    // Top inclined ramp surface (two triangles: 0-1-3 and 0-3-2)
    -hw, 0, 0,
    hw, 0, 0,
    hw, h, l,

    -hw, 0, 0,
    hw, h, l,
    -hw, h, l,

    // Back vertical face (two triangles: 2-3-5 and 2-5-4)
    -hw, h, l,
    hw, h, l,
    hw, 0, l,

    -hw, h, l,
    hw, 0, l,
    -hw, 0, l,

    // Left triangular side (triangle: 0-2-4)
    -hw, 0, 0,
    -hw, h, l,
    -hw, 0, l,

    // Right triangular side (triangle: 1-5-3)
    hw, 0, 0,
    hw, 0, l,
    hw, h, l,
  ]);

  const uvs = new Float32Array([
    // Top face
    0, 0,
    1, 0,
    1, 1,

    0, 0,
    1, 1,
    0, 1,

    // Back face
    0, 1,
    1, 1,
    1, 0,

    0, 1,
    1, 0,
    0, 0,

    // Left side
    0, 0,
    1, 1,
    1, 0,

    // Right side
    0, 0,
    1, 0,
    1, 1,
  ]);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}

/** Hazard caution stripe texture (yellow and black diagonal stripes) */
function createHazardTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.Texture() as THREE.CanvasTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#f5c518';
    ctx.fillRect(0, 0, 512, 128);
    ctx.fillStyle = '#111111';
    for (let x = -128; x < 640; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 40, 0);
      ctx.lineTo(x - 24, 128);
      ctx.lineTo(x - 64, 128);
      ctx.closePath();
      ctx.fill();
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

/** Concentric skidpan circular lines texture */
function createSkidpanTexture(): THREE.CanvasTexture {
  if (typeof document === 'undefined') return new THREE.Texture() as THREE.CanvasTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1e232d';
    ctx.fillRect(0, 0, 1024, 1024);

    // Concentric drift circles
    const radii = [120, 240, 360, 480];
    ctx.lineWidth = 10;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
    radii.forEach((r) => {
      ctx.beginPath();
      ctx.arc(512, 512, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Inner yellow donut circle
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#ffe600';
    ctx.beginPath();
    ctx.arc(512, 512, 180, 0, Math.PI * 2);
    ctx.stroke();

    // Tire donut skid marks
    ctx.lineWidth = 28;
    ctx.strokeStyle = 'rgba(10, 10, 10, 0.45)';
    for (let a = 0; a < 6; a++) {
      ctx.beginPath();
      ctx.ellipse(512, 512, 280 + a * 15, 260 + a * 10, (a * Math.PI) / 4, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Crosshairs
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.beginPath();
    ctx.moveTo(512, 10);
    ctx.lineTo(512, 1014);
    ctx.moveTo(10, 512);
    ctx.lineTo(1014, 512);
    ctx.stroke();
  }
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export function TestingGroundProps() {
  const T = track.current;
  const isOpenMap = !!T.meta.isOpenMap || T.meta.id === 'open';

  // Ramp geometry & materials
  const rampGeo = useMemo(() => createRampGeometry(36, 11, 80), []);
  const kickerRampGeo = useMemo(() => createRampGeometry(20, 15, 55), []);
  const hazardTex = useMemo(() => createHazardTexture(), []);
  const skidpanTex = useMemo(() => createSkidpanTexture(), []);

  const rampMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: hazardTex,
      roughness: 0.65,
      metalness: 0.35,
    });
  }, [hazardTex]);

  const skidpanMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: skidpanTex,
      roughness: 0.9,
      metalness: 0.05,
    });
  }, [skidpanTex]);

  const trussMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0x1f2735,
      roughness: 0.5,
      metalness: 0.7,
    });
  }, []);

  const coneMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: 0xff5500,
      roughness: 0.4,
    });
  }, []);

  const kerbRedMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.7 }), []);
  const kerbWhiteMat = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 }), []);

  // Distance Marker Banners for 1K Straight
  const banners1k = useMemo(() => {
    return [
      {
        key: 'g1k-start',
        text: '1000M ACCELERATION RUN',
        sub: 'STAGE 1 · MAX SPEED TEST',
        x: -4500,
        z: -3800,
        accent: '#00f0ff',
      },
      {
        key: 'g1k-750',
        text: '750 METERS',
        sub: 'CONTINUOUS FULL THROTTLE',
        x: -2000,
        z: -3800,
        accent: '#ffd700',
      },
      {
        key: 'g1k-500',
        text: '500 METERS · HALFWAY',
        sub: 'SPEED CHECK SPEED TRAP 1',
        x: 500,
        z: -3800,
        accent: '#ff8700',
      },
      {
        key: 'g1k-250',
        text: '250 METERS',
        sub: 'HEAVY BRAKING ZONE AHEAD',
        x: 3000,
        z: -3800,
        accent: '#dc2626',
      },
      {
        key: 'g1k-finish',
        text: '0M · SPEED TRAP FINISH',
        sub: 'BRAKE NOW! TURN 1 APPROACH',
        x: 5500,
        z: -3800,
        accent: '#dc2626',
      },
    ].map((b) => ({
      ...b,
      tex: getBanner(b.key, b.text, b.sub, 1024, 256, '#0b0f16', '#ffffff', b.accent),
    }));
  }, []);

  // Zone Gateways / Portals
  const zonePortals = useMemo(() => {
    return [
      {
        key: 'z-drift',
        text: 'ZONE 2: 360° DRIFT CIRLCE',
        sub: 'SKIDPAN & POWER SLIDE ARENA',
        x: 8800,
        y: 35,
        z: 400,
        yaw: 0,
      },
      {
        key: 'z-ramp',
        text: 'ZONE 3: STUNT JUMP RAMPS',
        sub: '⚠ DANGER: HIGH AIRTIME LAUNCH CREST ⚠',
        x: 100,
        y: 42,
        z: 4600,
        yaw: Math.PI,
      },
      {
        key: 'z-hairpins',
        text: 'ZONE 4: TWIN HAIRPIN COMPLEX',
        sub: 'HEAVY BRAKING & SLALOM AGILITY',
        x: -7300,
        y: 30,
        z: 2200,
        yaw: -Math.PI / 2,
      },
    ].map((z) => ({
      ...z,
      tex: getBanner(z.key, z.text, z.sub, 1024, 256, '#080c14', '#ffffff', '#c8ff2e'),
    }));
  }, []);

  // Slalom cone positions in Zone 4 (between hairpins)
  const slalomCones = useMemo(() => {
    const list: [number, number, number][] = [];
    for (let i = 0; i < 10; i++) {
      const x = -6100 - (i % 2 === 0 ? 12 : -12);
      const z = 700 - i * 140;
      list.push([x, 1.2, z]);
    }
    return list;
  }, []);

  if (!isOpenMap) return null;

  return (
    <group name="testing-ground-props">
      {/* ============================================================ */}
      {/* ZONE 1: 1K STRAIGHTAWAY GANTRIES & SPEED TRAPS               */}
      {/* ============================================================ */}
      {banners1k.map((gantry, idx) => (
        <group key={gantry.key} position={[gantry.x, 0, gantry.z]} rotation={[0, Math.PI / 2, 0]}>
          {/* Overhead Horizontal Truss */}
          <mesh position={[0, 32, 0]} castShadow>
            <boxGeometry args={[56, 4.5, 5]} />
            <primitive object={trussMat} attach="material" />
          </mesh>
          {/* Left & Right Support Columns */}
          {[-26, 26].map((xSide, i) => (
            <mesh key={i} position={[xSide, 16, 0]} castShadow>
              <boxGeometry args={[4, 32, 4]} />
              <primitive object={trussMat} attach="material" />
            </mesh>
          ))}
          {/* Overhead High-Res Distance Banner */}
          <mesh position={[0, 32, 2.7]}>
            <planeGeometry args={[52, 10]} />
            <meshBasicMaterial map={gantry.tex} toneMapped={false} />
          </mesh>
          <mesh position={[0, 32, -2.7]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[52, 10]} />
            <meshBasicMaterial map={gantry.tex} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* Drag Strip Christmas Tree Staging Light at Start (-4500, -3825) */}
      <group position={[-4500, 0, -3825]}>
        <mesh position={[0, 16, 0]}>
          <boxGeometry args={[2, 32, 2]} />
          <primitive object={trussMat} attach="material" />
        </mesh>
        {/* Pre-stage blue & countdown bulbs */}
        {[8, 12, 16, 20, 24].map((yLevel, i) => (
          <group key={i} position={[0, yLevel, 0]}>
            {[-2.2, 2.2].map((xOff, j) => (
              <mesh key={j} position={[xOff, 0, 0]}>
                <sphereGeometry args={[1.2, 16, 16]} />
                <meshStandardMaterial
                  color={i === 0 ? 0x00e5ff : i === 4 ? 0x00ff00 : 0xffcc00}
                  emissive={i === 0 ? 0x00e5ff : i === 4 ? 0x00ff00 : 0xffcc00}
                  emissiveIntensity={1.8}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* ============================================================ */}
      {/* ZONE 2: SKIDPAN & 360° DRIFT CIRLCE                          */}
      {/* ============================================================ */}
      {/* Giant Circular Drift Pad Geometry */}
      <mesh position={[8800, 0.12, 400]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1400, 64]} />
        <primitive object={skidpanMat} attach="material" />
      </mesh>

      {/* Central Drift Tower & Hazard Beacon */}
      <group position={[8800, 0, 400]}>
        <mesh position={[0, 25, 0]} castShadow>
          <cylinderGeometry args={[14, 18, 50, 16]} />
          <meshStandardMaterial color={0x232d3d} roughness={0.6} metalness={0.4} />
        </mesh>
        <mesh position={[0, 52, 0]}>
          <cylinderGeometry args={[22, 14, 6, 16]} />
          <meshStandardMaterial map={hazardTex} roughness={0.5} />
        </mesh>
        {/* Flashing Amber Drift Beacon */}
        <mesh position={[0, 57, 0]}>
          <sphereGeometry args={[4, 16, 16]} />
          <meshStandardMaterial color={0xffaa00} emissive={0xffaa00} emissiveIntensity={2.5} />
        </mesh>
      </group>

      {/* ============================================================ */}
      {/* ZONE 3: STUNT JUMP LAUNCH RAMPS                              */}
      {/* ============================================================ */}
      {/* Main Takeoff Ramp (Left Lane) */}
      <group position={[250, 0, 4530]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh geometry={rampGeo} material={rampMat} castShadow receiveShadow />
      </group>

      {/* Steep Kicker Ramp (Right Lane) */}
      <group position={[-150, 0, 4530]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh geometry={kickerRampGeo} material={rampMat} castShadow receiveShadow />
      </group>

      {/* Stunt Jump Warning Gantry */}
      <group position={[500, 0, 4530]} rotation={[0, Math.PI / 2, 0]}>
        <mesh position={[0, 36, 0]}>
          <boxGeometry args={[46, 4, 4]} />
          <primitive object={trussMat} attach="material" />
        </mesh>
        {[-22, 22].map((xSide, i) => (
          <mesh key={i} position={[xSide, 18, 0]}>
            <boxGeometry args={[3, 36, 3]} />
            <primitive object={trussMat} attach="material" />
          </mesh>
        ))}
        {/* Warning Hazard Lights */}
        {[-14, 0, 14].map((xOff, i) => (
          <mesh key={i} position={[xOff, 36, 2.4]}>
            <sphereGeometry args={[1.8, 16, 16]} />
            <meshStandardMaterial color={0xff3b30} emissive={0xff3b30} emissiveIntensity={2.2} />
          </mesh>
        ))}
      </group>

      {/* ============================================================ */}
      {/* ZONE 4: TWIN HAIRPIN COMPLEX & SLALOM AGILITY                */}
      {/* ============================================================ */}
      {/* Slalom Traffic Cones */}
      {slalomCones.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh castShadow>
            <coneGeometry args={[2.5, 7, 16]} />
            <primitive object={coneMat} attach="material" />
          </mesh>
          <mesh position={[0, -3.2, 0]}>
            <boxGeometry args={[6, 0.6, 6]} />
            <meshStandardMaterial color={0x111111} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Hairpin 1 Apex Red & White Kerbs at (-6800, 900) */}
      <group position={[-6800, 0.15, 900]}>
        {[-30, -15, 0, 15, 30].map((offset, i) => (
          <mesh key={i} position={[offset, 0, 0]}>
            <boxGeometry args={[14, 0.6, 8]} />
            <primitive object={i % 2 === 0 ? kerbRedMat : kerbWhiteMat} attach="material" />
          </mesh>
        ))}
      </group>

      {/* Hairpin 2 Apex Red & White Kerbs at (-7800, -1600) */}
      <group position={[-7800, 0.15, -1600]}>
        {[-30, -15, 0, 15, 30].map((offset, i) => (
          <mesh key={i} position={[0, 0, offset]}>
            <boxGeometry args={[8, 0.6, 14]} />
            <primitive object={i % 2 === 0 ? kerbRedMat : kerbWhiteMat} attach="material" />
          </mesh>
        ))}
      </group>

      {/* Zone Portals */}
      {zonePortals.map((portal) => (
        <group key={portal.key} position={[portal.x, portal.y, portal.z]} rotation={[0, portal.yaw, 0]}>
          <mesh>
            <planeGeometry args={[48, 12]} />
            <meshBasicMaterial map={portal.tex} toneMapped={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
