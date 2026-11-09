# Photorealistic still of the illustrative iBIM building, path-traced in Blender Cycles.
# Run: Blender --background --python src/3d/render_visual.py -- OUTPUT_PATH WIDTH HEIGHT SAMPLES
import bpy, bmesh, math, random, sys
from mathutils import Vector

args = sys.argv[sys.argv.index('--') + 1:]
OUT, RES_X, RES_Y, SAMPLES = args[0], int(args[1]), int(args[2]), int(args[3])
random.seed(19)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

W, D, FLOORS, FH, BAY = 30.0, 18.0, 5, 3.6, 3.0
H = FLOORS * FH


# Coordinates match the web scene: x right, y up, z towards the viewer. Blender is z-up.
def to_b(x, y, z):
    return (x, -z, y)


def mat(name, color=(.8, .8, .8), rough=.6, metal=0, transmission=0, ior=1.45, emit=None, strength=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes['Principled BSDF']
    p.inputs['Base Color'].default_value = (*color, 1)
    p.inputs['Roughness'].default_value = rough
    p.inputs['Metallic'].default_value = metal
    p.inputs['IOR'].default_value = ior
    p.inputs['Transmission Weight'].default_value = transmission
    if emit:
        p.inputs['Emission Color'].default_value = (*emit, 1)
        p.inputs['Emission Strength'].default_value = strength
    return m


def textured(name, build, rough=.8):
    m = mat(name, rough=rough)
    t = m.node_tree
    p = t.nodes['Principled BSDF']
    coord = t.nodes.new('ShaderNodeTexCoord')
    build(t, p, coord.outputs['Object'])
    return m


def noise_colour(a, b, scale, detail=8):
    def build(t, p, vec):
        n = t.nodes.new('ShaderNodeTexNoise')
        n.inputs['Scale'].default_value = scale
        n.inputs['Detail'].default_value = detail
        r = t.nodes.new('ShaderNodeValToRGB')
        r.color_ramp.elements[0].position = .32
        r.color_ramp.elements[0].color = (*a, 1)
        r.color_ramp.elements[1].position = .68
        r.color_ramp.elements[1].color = (*b, 1)
        t.links.new(vec, n.inputs['Vector'])
        t.links.new(n.outputs['Fac'], r.inputs['Fac'])
        t.links.new(r.outputs['Color'], p.inputs['Base Color'])
        bump = t.nodes.new('ShaderNodeBump')
        bump.inputs['Strength'].default_value = .25
        t.links.new(n.outputs['Fac'], bump.inputs['Height'])
        t.links.new(bump.outputs['Normal'], p.inputs['Normal'])
    return build


def brick_build(t, p, vec):
    b = t.nodes.new('ShaderNodeTexBrick')
    b.inputs['Color1'].default_value = (.17, .05, .03, 1)
    b.inputs['Color2'].default_value = (.1, .032, .02, 1)
    b.inputs['Mortar'].default_value = (.24, .22, .19, 1)
    b.inputs['Scale'].default_value = 1
    b.inputs['Mortar Size'].default_value = .009
    b.inputs['Brick Width'].default_value = .215
    b.inputs['Row Height'].default_value = .075
    # Brick Texture projects onto XY, so map walls: along the wall on U and height on V.
    split = t.nodes.new('ShaderNodeSeparateXYZ')
    add = t.nodes.new('ShaderNodeMath')
    join = t.nodes.new('ShaderNodeCombineXYZ')
    t.links.new(vec, split.inputs[0])
    t.links.new(split.outputs['X'], add.inputs[0])
    t.links.new(split.outputs['Y'], add.inputs[1])
    t.links.new(add.outputs[0], join.inputs['X'])
    t.links.new(split.outputs['Z'], join.inputs['Y'])
    t.links.new(join.outputs[0], b.inputs['Vector'])
    t.links.new(b.outputs['Color'], p.inputs['Base Color'])
    bump = t.nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = .6
    t.links.new(b.outputs['Fac'], bump.inputs['Height'])
    t.links.new(bump.outputs['Normal'], p.inputs['Normal'])


def paving_build(t, p, vec):
    b = t.nodes.new('ShaderNodeTexBrick')
    b.inputs['Color1'].default_value = (.27, .26, .235, 1)
    b.inputs['Color2'].default_value = (.21, .205, .185, 1)
    b.inputs['Mortar'].default_value = (.075, .07, .065, 1)
    b.inputs['Scale'].default_value = 1
    b.inputs['Mortar Size'].default_value = .007
    b.inputs['Brick Width'].default_value = .9
    b.inputs['Row Height'].default_value = .45
    t.links.new(vec, b.inputs['Vector'])
    t.links.new(b.outputs['Color'], p.inputs['Base Color'])
    bump = t.nodes.new('ShaderNodeBump')
    bump.inputs['Strength'].default_value = .4
    t.links.new(b.outputs['Fac'], bump.inputs['Height'])
    t.links.new(bump.outputs['Normal'], p.inputs['Normal'])


concrete = textured('concrete', noise_colour((.34, .33, .3), (.47, .46, .42), 3), .78)
brick = textured('brick', brick_build, .88)
alu = mat('aluminium', (.055, .06, .065), .32, .9)
glass = mat('glass', (.72, .84, .86), .015, 0, 1, 1.5)
room = mat('room', (.55, .52, .46), .85)
floorm = mat('floor', (.16, .13, .1), .4)
ceil = mat('ceiling', (.82, .8, .75), .8)
light = mat('light', (1, .95, .85), .5, emit=(1, .86, .66), strength=11)
blind = mat('blind', (.72, .7, .64), .85)
plant = mat('plant', (.27, .28, .27), .45, .55)
lawn = textured('lawn', noise_colour((.035, .085, .012), (.085, .15, .03), .55), .92)
paving = textured('paving', paving_build, .78)
asphalt = textured('asphalt', noise_colour((.008, .0085, .009), (.026, .026, .025), 90, 12), .9)
white_line = mat('line', (.55, .54, .5), .7)
kerb = textured('kerb', noise_colour((.2, .195, .18), (.3, .29, .27), 8), .85)
bark = textured('bark', noise_colour((.03, .022, .016), (.09, .07, .05), 26), .95)


def window_grid(t, p, vec):
    # Rows of dark windows in a pale wall, for the neighbouring buildings.
    split = t.nodes.new('ShaderNodeSeparateXYZ')
    add = t.nodes.new('ShaderNodeMath')
    join = t.nodes.new('ShaderNodeCombineXYZ')
    t.links.new(vec, split.inputs[0])
    t.links.new(split.outputs['X'], add.inputs[0])
    t.links.new(split.outputs['Y'], add.inputs[1])
    t.links.new(add.outputs[0], join.inputs['X'])
    t.links.new(split.outputs['Z'], join.inputs['Y'])
    b = t.nodes.new('ShaderNodeTexBrick')
    b.inputs['Color1'].default_value = (.03, .045, .06, 1)
    b.inputs['Color2'].default_value = (.05, .065, .08, 1)
    b.inputs['Mortar'].default_value = (.38, .35, .31, 1)
    b.inputs['Scale'].default_value = 1
    b.inputs['Mortar Size'].default_value = .62
    b.inputs['Brick Width'].default_value = 3.2
    b.inputs['Row Height'].default_value = 3.3
    b.offset = 0
    b.squash = 1
    t.links.new(join.outputs[0], b.inputs['Vector'])
    t.links.new(b.outputs['Color'], p.inputs['Base Color'])
    t.links.new(b.outputs['Fac'], p.inputs['Roughness'])


distant = textured('distant', window_grid, .7)


def cube_mesh(name, parts, material):
    """parts: list of (w, h, d, x, y, z) in web coordinates. Joins them into one mesh."""
    bm = bmesh.new()
    for w, h, d, x, y, z in parts:
        r = bmesh.ops.create_cube(bm, size=1)
        vs = r['verts']
        for v in vs:
            v.co = Vector((v.co.x * w + x, -(v.co.y * d) - z, v.co.z * h + y))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    me.materials.append(material)
    return ob


# Structure: slabs, parapet, interior walls.
slabs, floors, ceilings, backs, lights, blinds, panes, mullions, transoms, bricks, entrance = [], [], [], [], [], [], [], [], [], [], []
for f in range(FLOORS):
    y = f * FH
    slabs.append((W + .5, .42, D + .5, 0, y + FH - .05, 0))
    floors.append((W - .3, .03, D - .3, 0, y + .22, 0))
    ceilings.append((W - .3, .04, D - .3, 0, y + FH - .29, 0))
    backs.append((W - 12, FH, D - 10, 0, y + FH / 2, 0))
    for i in range(9):
        for k in range(3):
            lights.append((1.7, .03, .28, -W / 2 + 2 + i * 3.3, y + FH - .32, D / 2 - 1.6 - k * 2.8))
            lights.append((.28, .03, 1.7, W / 2 - 1.6 - k * 2.8, y + FH - .32, -D / 2 + 2 + i * 1.9))
slabs.append((W + .6, .45, D + .6, 0, .22, 0))


def facade(fixed, length, axis, front):
    count = round(length / BAY)
    for f in range(FLOORS):
        for i in range(count):
            pos = -length / 2 + BAY * (i + .5)
            y = f * FH + FH / 2 + .2
            place = (lambda a, b, h, c: (a, h, b, pos, c, fixed)) if axis == 'x' else (lambda a, b, h, c: (b, h, a, fixed, c, pos))
            door = f == 0 and axis == 'x' and front and abs(pos) < 3.2
            if f == 0 and not door and i % 3 != 1:
                bricks.append(place(BAY, .4, FH - .46, y - .12))
                continue
            pane_h = FH - .54
            panes.append(place(BAY - .1, .025, pane_h, y))
            for side in (-BAY / 2, BAY / 2):
                mullions.append((.07 if axis == 'x' else .17, FH - .42, .17 if axis == 'x' else .07,
                                 (pos + side) if axis == 'x' else fixed, y, fixed if axis == 'x' else (pos + side)))
            transoms.append(place(BAY, .17, .06, y - pane_h / 2))
            transoms.append(place(BAY, .17, .06, y + pane_h / 2))
            if random.random() < .42:
                drop = random.uniform(.35, 1.9)
                inset = fixed - .12 * (1 if fixed > 0 else -1)
                if axis == 'x':
                    blinds.append((BAY - .2, drop, .02, pos, y + pane_h / 2 - drop / 2 - .03, inset))
                else:
                    blinds.append((.02, drop, BAY - .2, inset, y + pane_h / 2 - drop / 2 - .03, pos))


facade(D / 2 + .05, W, 'x', True)
facade(-D / 2 - .05, W, 'x', False)
facade(W / 2 + .05, D, 'z', False)
facade(-W / 2 - .05, D, 'z', False)
top = H + .17
parapet = [(W + .5, .75, .3, 0, top + .37, D / 2 + .1), (W + .5, .75, .3, 0, top + .37, -D / 2 - .1),
           (.3, .75, D + .5, W / 2 + .1, top + .37, 0), (.3, .75, D + .5, -W / 2 - .1, top + .37, 0)]
cap = [(W + .7, .06, .5, 0, top + .77, D / 2 + .1), (W + .7, .06, .5, 0, top + .77, -D / 2 - .1),
       (.5, .06, D + .7, W / 2 + .1, top + .77, 0), (.5, .06, D + .7, -W / 2 - .1, top + .77, 0)]
canopy = [(8, .22, 2.6, 0, 3.15, D / 2 + 1.4), (.14, 3, .14, -3.7, 1.6, D / 2 + 2.4), (.14, 3, .14, 3.7, 1.6, D / 2 + 2.4)]
plant_units = [(11, 1.8, 7, -2, top + .9, 0), (3, 1.2, 3, 8, top + .6, 3), (2.2, .9, 2.2, 8, top + .45, -3)]

cube_mesh('slabs', slabs + parapet, concrete)
cube_mesh('caps', cap, alu)
cube_mesh('floors', floors, floorm)
cube_mesh('ceilings', ceilings, ceil)
cube_mesh('core', backs, room)
cube_mesh('lights', lights, light)
cube_mesh('blinds', blinds, blind)
cube_mesh('panes', panes, glass)
cube_mesh('mullions', mullions + transoms + canopy, alu)
cube_mesh('brick', bricks, brick)
cube_mesh('plant', plant_units, plant)

# Ground.
cube_mesh('lawn', [(900, .1, 900, 0, -.1, 0)], lawn)
cube_mesh('paving', [(W + 10, .06, 14, 0, -.015, D / 2 + 7), (10, .06, 24, -W / 2 - 7, -.015, 2), (W + 24, .06, 6, 0, -.015, -D / 2 - 3)], paving)
cube_mesh('road', [(900, .06, 10, 0, -.03, D / 2 + 22)], asphalt)
cube_mesh('kerbs', [(900, .16, .3, 0, .0, D / 2 + 16.9), (900, .16, .3, 0, .0, D / 2 + 27.1)], kerb)
cube_mesh('lines', [(2.6, .012, .16, i * 6.5, .002, D / 2 + 22) for i in range(-30, 31)], white_line)
cube_mesh('neighbours', [(30, 24, 24, -78, 12, -52), (32, 32, 20, -30, 16, -82), (30, 20, 26, 40, 10, -78), (26, 28, 28, 95, 14, -40), (28, 15, 34, -112, 7.5, 16), (34, 14, 28, 112, 7, 36)], distant)


# Grass blades, dense near the camera side of the lawn.
def grass(count, x0, x1, z0, z1, keepout):
    verts, faces = [], []
    for _ in range(count):
        x, z = random.uniform(x0, x1), random.uniform(z0, z1)
        if keepout(x, z):
            continue
        h = random.uniform(.05, .13)
        a = random.uniform(0, math.pi)
        dx, dy = math.cos(a) * .012, math.sin(a) * .012
        lx, ly = random.uniform(-.03, .03), random.uniform(-.03, .03)
        n = len(verts)
        bx, by, bz = to_b(x, 0, z)
        verts += [(bx - dx, by - dy, bz), (bx + dx, by + dy, bz), (bx + lx, by + ly, bz + h)]
        faces.append((n, n + 1, n + 2))
    me = bpy.data.meshes.new('grass')
    me.from_pydata(verts, [], faces)
    ob = bpy.data.objects.new('grass', me)
    bpy.context.collection.objects.link(ob)
    m = mat('grass', (.07, .16, .03), .75)
    me.materials.append(m)


def not_lawn(x, z):
    if abs(x) < W / 2 + 5.2 and -D / 2 - 6.2 < z < D / 2 + 14.2:
        return True
    if -W / 2 - 12.2 < x < -W / 2 - 1.8 and -D / 2 - 1 < z < D / 2 + 5:
        return True
    return D / 2 + 16.6 < z < D / 2 + 27.4


grass(int(1100000 * min(1, SAMPLES / 64)), -55, 55, -10, 62, not_lawn)


# Trees: a trunk and branches, each carrying clusters of individual leaves.
leaf_mat = mat('leaf', (.05, .14, .025), .55)
leaf_nodes = leaf_mat.node_tree
p = leaf_nodes.nodes['Principled BSDF']
info = leaf_nodes.nodes.new('ShaderNodeObjectInfo')
geo_rand = leaf_nodes.nodes.new('ShaderNodeNewGeometry')
ramp = leaf_nodes.nodes.new('ShaderNodeValToRGB')
ramp.color_ramp.elements[0].color = (.028, .085, .016, 1)
ramp.color_ramp.elements[1].color = (.13, .21, .045, 1)
leaf_nodes.links.new(geo_rand.outputs['Random Per Island'], ramp.inputs['Fac'])
leaf_nodes.links.new(ramp.outputs['Color'], p.inputs['Base Color'])
p.inputs['Transmission Weight'].default_value = .22
p.inputs['Subsurface Weight'].default_value = 0


def tree(x, z, size, leaves_each):
    verts, faces = [], []
    tv, tf = [], []

    def tube(a, b, r0, r1, sides=6):
        n = len(tv)
        axis = (b - a).normalized()
        u = axis.orthogonal().normalized()
        v = axis.cross(u)
        for i in range(sides):
            ang = 2 * math.pi * i / sides
            d = u * math.cos(ang) + v * math.sin(ang)
            tv.append(tuple(a + d * r0))
            tv.append(tuple(b + d * r1))
        for i in range(sides):
            j = (i + 1) % sides
            tf.append((n + 2 * i, n + 2 * j, n + 2 * j + 1, n + 2 * i + 1))

    def cluster(c, radius):
        for _ in range(leaves_each):
            d = Vector((random.gauss(0, 1), random.gauss(0, 1), random.gauss(0, .72)))
            d.normalize()
            at = c + d * radius * random.uniform(.25, 1.05)
            n = Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(-.3, 1))).normalized()
            s = n.orthogonal().normalized()
            t = n.cross(s)
            l = random.uniform(.075, .14) * size
            w = l * .48
            b0 = len(verts)
            verts.extend([tuple(at - s * l), tuple(at - t * w), tuple(at + s * l), tuple(at + t * w)])
            faces.append((b0, b0 + 1, b0 + 2, b0 + 3))

    def branch(a, direction, length, r, depth):
        b = a + direction * length
        tube(a, b, r, r * .66)
        if depth == 0:
            cluster(b, random.uniform(1.25, 1.85) * size)
            return
        for _ in range(random.choice((2, 3))):
            nd = (direction + Vector((random.uniform(-.75, .75), random.uniform(-.75, .75), random.uniform(-.05, .55)))).normalized()
            branch(b, nd, length * random.uniform(.62, .82), r * .62, depth - 1)

    bx, by, bz = to_b(x, 0, z)
    base = Vector((bx, by, 0))
    trunk_h = 2.9 * size
    top_pt = base + Vector((random.uniform(-.25, .25), random.uniform(-.25, .25), trunk_h))
    tube(base, top_pt, .27 * size, .2 * size, 8)
    for _ in range(4):
        d = Vector((random.uniform(-1, 1), random.uniform(-1, 1), random.uniform(.55, 1.15))).normalized()
        branch(top_pt, d, 2 * size, .13 * size, 3)

    for name, vs, fs, material in (('trunk', tv, tf, bark), ('leaves', verts, faces, leaf_mat)):
        me = bpy.data.meshes.new(name)
        me.from_pydata(vs, [], fs)
        for poly in me.polygons:
            poly.use_smooth = name == 'trunk'
        ob = bpy.data.objects.new(name, me)
        bpy.context.collection.objects.link(ob)
        me.materials.append(material)


leaves_each = 3600 if SAMPLES >= 64 else 900
for i in range(26):
    tree(-150 + i * 12 + random.uniform(-4, 4), -112 + random.uniform(-14, 10), random.uniform(1.6, 2.2), 260 if SAMPLES < 64 else 500)
for x, z, s in [(-24, 0, 1.08), (-25, 13, 1.2), (-22, -13, 1), (27, -9, 1.02), (27, 4, 1.16), (28, 16, .96), (-11.5, 25, 1.04), (17, 13, .68), (24, 27, 1.1), (-30, 36, 1.2), (46, -12, 1.2), (-52, 18, 1.25), (55, 26, 1.1), (-6, -21, 1.1), (13, -22, 1.2)]:
    tree(x, z, s, leaves_each)

# Sky and sun.
world = bpy.data.worlds.new('sky')
scene.world = world
world.use_nodes = True
wt = world.node_tree
sky = wt.nodes.new('ShaderNodeTexSky')
sky.sky_type = 'MULTIPLE_SCATTERING'
for attr, value in (('sun_elevation', math.radians(39)), ('sun_rotation', math.radians(218)), ('sun_size', math.radians(1.2)),
                    ('altitude', 70), ('air_density', 1), ('aerosol_density', 1.15), ('dust_density', 1.15), ('ozone_density', 1)):
    if hasattr(sky, attr):
        setattr(sky, attr, value)
bg = wt.nodes['Background']
bg.inputs['Strength'].default_value = .27
# Clouds: stretched noise, fading out towards the horizon, mixed over the sky.
tc = wt.nodes.new('ShaderNodeTexCoord')
mp = wt.nodes.new('ShaderNodeMapping')
mp.inputs['Scale'].default_value = (1.3, 2.2, 6.5)
wt.links.new(tc.outputs['Generated'], mp.inputs['Vector'])
nz = wt.nodes.new('ShaderNodeTexNoise')
nz.inputs['Scale'].default_value = 2.6
nz.inputs['Detail'].default_value = 14
nz.inputs['Roughness'].default_value = .58
wt.links.new(mp.outputs['Vector'], nz.inputs['Vector'])
cr = wt.nodes.new('ShaderNodeValToRGB')
cr.color_ramp.elements[0].position = .5
cr.color_ramp.elements[1].position = .7
wt.links.new(nz.outputs['Fac'], cr.inputs['Fac'])
sp = wt.nodes.new('ShaderNodeSeparateXYZ')
wt.links.new(tc.outputs['Generated'], sp.inputs[0])
hz = wt.nodes.new('ShaderNodeMapRange')
hz.inputs['From Min'].default_value = .03
hz.inputs['From Max'].default_value = .22
wt.links.new(sp.outputs['Z'], hz.inputs['Value'])
mul = wt.nodes.new('ShaderNodeMath')
mul.operation = 'MULTIPLY'
wt.links.new(cr.outputs['Color'], mul.inputs[0])
wt.links.new(hz.outputs['Result'], mul.inputs[1])
cloud_rgb = wt.nodes.new('ShaderNodeRGB')
cloud_rgb.outputs[0].default_value = (5.5, 5.4, 5.2, 1)
mix = wt.nodes.new('ShaderNodeMix')
mix.data_type = 'RGBA'
wt.links.new(mul.outputs[0], mix.inputs['Factor'])
wt.links.new(sky.outputs['Color'], mix.inputs['A'])
wt.links.new(cloud_rgb.outputs[0], mix.inputs['B'])
wt.links.new(mix.outputs['Result'], bg.inputs['Color'])

# Camera: the same view the web scene ends on.
cam_data = bpy.data.cameras.new('cam')
cam_data.sensor_fit = 'VERTICAL'
cam_data.angle_y = math.radians(30)
cam_data.clip_end = 3000
cam = bpy.data.objects.new('cam', cam_data)
bpy.context.collection.objects.link(cam)
angle, radius, height = .45, 82.2, 9
cam.location = to_b(math.sin(angle) * radius, height, math.cos(angle) * radius)
direction = Vector(to_b(0, 7.6, 0)) - cam.location
cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()
scene.camera = cam

# Render settings.
scene.render.engine = 'CYCLES'
prefs = bpy.context.preferences.addons['cycles'].preferences
try:
    prefs.compute_device_type = 'METAL'
    prefs.get_devices()
    for d in prefs.devices:
        d.use = True
    scene.cycles.device = 'GPU'
except Exception as err:
    print('GPU not available', err)
scene.cycles.samples = SAMPLES
scene.cycles.use_denoising = True
scene.cycles.max_bounces = 8
scene.cycles.glossy_bounces = 5
scene.cycles.transmission_bounces = 8
scene.cycles.caustics_reflective = False
scene.cycles.caustics_refractive = False
scene.render.resolution_x = RES_X
scene.render.resolution_y = RES_Y
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'JPEG'
scene.render.image_settings.quality = 90
scene.render.filepath = OUT
scene.view_settings.view_transform = 'AgX'
scene.view_settings.look = 'AgX - High Contrast'
scene.view_settings.exposure = -.55
bpy.ops.render.render(write_still=True)
print('DONE', OUT)
