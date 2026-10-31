"""
F1 2022 Car Model Setup Script for Blender
===========================================
This script imports and configures the Open Race 2022 F1 Car model inside Blender.
It creates:
  1. Complete F1 Car hierarchy (Chassis, Aerodynamics, DRS Flap, Wheels, Steering Wheel)
  2. Principled BSDF PBR Materials (Car Paint with Clearcoat, Carbon Fiber, Tyre Rubber, Alloy Rims)
  3. Studio Lighting & Turntable Camera Rig

HOW TO USE IN BLENDER:
  1. Open Blender (v3.0+ or v4.x).
  2. Switch to the 'Scripting' workspace at the top.
  3. Click 'Open' and select this file (`f1_car_blender.py`).
  4. Make sure `f1_car.obj` is located in the same directory (or update OBJ_PATH below).
  5. Click 'Run Script' (▶).
"""

import bpy
import os
import math

# Path to the exported F1 Car OBJ file
SCRIPT_DIR = os.path.dirname(os.path.realpath(__file__)) if "__file__" in locals() else ""
OBJ_PATH = os.path.join(SCRIPT_DIR, "f1_car.obj")

def clear_default_scene():
    """Removes default cube, light, and camera if starting fresh."""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

def create_pbr_material(name, base_color=(0.1, 0.25, 0.7, 1.0), metallic=0.0, roughness=0.3, clearcoat=0.0):
    """Creates a Principled BSDF material with custom PBR properties."""
    mat = bpy.data.materials.get(name)
    if mat is None:
        mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        # Set Base Color
        if "Base Color" in bsdf.inputs:
            bsdf.inputs["Base Color"].default_value = base_color
        # Set Metallic
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metallic
        # Set Roughness
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        # Set Clearcoat (Blender 4.0 uses Coat Weight)
        if "Clearcoat" in bsdf.inputs:
            bsdf.inputs["Clearcoat"].default_value = clearcoat
        elif "Coat Weight" in bsdf.inputs:
            bsdf.inputs["Coat Weight"].default_value = clearcoat
    return mat

def setup_materials():
    """Generates all the authentic F1 materials."""
    materials = {
        "F1_Paint_Blue": create_pbr_material("F1_Paint_Blue", base_color=(0.04, 0.12, 0.55, 1.0), metallic=0.7, roughness=0.18, clearcoat=1.0),
        "F1_Carbon": create_pbr_material("F1_Carbon", base_color=(0.03, 0.03, 0.035, 1.0), metallic=0.1, roughness=0.35, clearcoat=0.2),
        "F1_Rubber": create_pbr_material("F1_Rubber", base_color=(0.04, 0.04, 0.04, 1.0), metallic=0.0, roughness=0.75, clearcoat=0.0),
        "F1_Rim_Alloy": create_pbr_material("F1_Rim_Alloy", base_color=(0.6, 0.6, 0.62, 1.0), metallic=0.9, roughness=0.25, clearcoat=0.4),
        "F1_Tyre_Stripe_Soft": create_pbr_material("F1_Tyre_Stripe_Soft", base_color=(0.85, 0.02, 0.02, 1.0), metallic=0.0, roughness=0.3, clearcoat=0.5),
        "F1_Cockpit_Yoke": create_pbr_material("F1_Cockpit_Yoke", base_color=(0.06, 0.06, 0.06, 1.0), metallic=0.2, roughness=0.5, clearcoat=0.0),
    }
    return materials

def assign_materials_to_objects(mats):
    """Assigns the created materials to imported car parts by name."""
    for obj in bpy.context.scene.objects:
        name = obj.name.lower()
        mat_to_apply = None

        if "body" in name or "paint" in name:
            mat_to_apply = mats["F1_Paint_Blue"]
        elif "carbon" in name or "flap" in name or "aero" in name:
            mat_to_apply = mats["F1_Carbon"]
        elif "tyre" in name or "tire" in name:
            mat_to_apply = mats["F1_Rubber"]
        elif "rim" in name:
            mat_to_apply = mats["F1_Rim_Alloy"]
        elif "wheel" in name and "steering" in name:
            mat_to_apply = mats["F1_Cockpit_Yoke"]

        if mat_to_apply:
            if obj.data and hasattr(obj.data, "materials"):
                if len(obj.data.materials) == 0:
                    obj.data.materials.append(mat_to_apply)
                else:
                    obj.data.materials[0] = mat_to_apply

def setup_studio():
    """Sets up a three-point lighting rig and camera."""
    # Camera
    cam_data = bpy.data.cameras.new("StudioCamera")
    cam_data.lens = 50
    cam_obj = bpy.data.objects.new("StudioCamera", cam_data)
    bpy.context.scene.collection.objects.link(cam_obj)
    cam_obj.location = (5.5, -4.5, 2.6)
    cam_obj.rotation_euler = (math.radians(68), 0, math.radians(48))
    bpy.context.scene.camera = cam_obj

    # Key Light
    key_light_data = bpy.data.lights.new(name="KeyLight", type='AREA')
    key_light_data.energy = 800
    key_light_data.size = 5.0
    key_light = bpy.data.objects.new(name="KeyLight", object_data=key_light_data)
    bpy.context.scene.collection.objects.link(key_light)
    key_light.location = (4.0, -3.0, 5.0)

    # Fill Light
    fill_light_data = bpy.data.lights.new(name="FillLight", type='AREA')
    fill_light_data.energy = 300
    fill_light_data.size = 4.0
    fill_light = bpy.data.objects.new(name="FillLight", object_data=fill_light_data)
    bpy.context.scene.collection.objects.link(fill_light)
    fill_light.location = (-4.0, 3.0, 3.5)

    # Rim / Backlight
    rim_light_data = bpy.data.lights.new(name="RimLight", type='AREA')
    rim_light_data.energy = 600
    rim_light_data.size = 6.0
    rim_light = bpy.data.objects.new(name="RimLight", object_data=rim_light_data)
    bpy.context.scene.collection.objects.link(rim_light)
    rim_light.location = (0.0, 6.0, 4.0)

def main():
    print("Initializing F1 2022 Car Model import in Blender...")
    clear_default_scene()

    # Import OBJ
    if os.path.exists(OBJ_PATH):
        print(f"Loading OBJ from: {OBJ_PATH}")
        # Blender 4.0+ uses wm.obj_import, older versions use import_scene.obj
        if hasattr(bpy.ops.wm, "obj_import"):
            bpy.ops.wm.obj_import(filepath=OBJ_PATH)
        else:
            bpy.ops.import_scene.obj(filepath=OBJ_PATH)
    else:
        print(f"Notice: '{OBJ_PATH}' not found in script dir. Please place 'f1_car.obj' in the same folder.")

    # Materials & Studio
    mats = setup_materials()
    assign_materials_to_objects(mats)
    setup_studio()

    # Shade smooth all meshes
    for obj in bpy.context.scene.objects:
        if obj.type == 'MESH':
            bpy.context.view_layer.objects.active = obj
            bpy.ops.object.shade_smooth()

    print("F1 Car setup complete! Switch to Rendered or Material Preview viewport to view.")

if __name__ == "__main__":
    main()
