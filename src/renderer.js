import "./index.css";
import * as BABYLON from "@babylonjs/core";

var infodiv = document.getElementById("infodiv");

var DataReceived = false;
var DATA;
var positionArr = [];
var indexArr = [];
var MESH_ARR = [];
var dataArr = [];
var SELECTED_MESH_ARR = [];

var readClipboardBtn = document.getElementById("readClipboardBtn");
var clearClipboardBtn = document.getElementById("clearClipboardBtn");

clearClipboardBtn.addEventListener("click", () => {
    api.clearClipboard();
    infodiv.innerHTML = "info from clipboard";
});

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas);
const createScene = async () => {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(1, 1, 1);
    // scene.createDefaultCameraOrLight(true, false, true);
    var camera = new BABYLON.ArcRotateCamera(
        "mycam",
        0,
        0,
        10,
        new BABYLON.Vector3(0, 0, 0),
        scene
    );
    camera.setPosition(new BABYLON.Vector3(10, 10, 10));
    camera.attachControl(true);
    camera.wheelPrecision = 10;

    // var mat0 = new BABYLON.StandardMaterial("mat1", scene);
    // mat0.diffuseColor = new BABYLON.Color3(1, 0, 0);
    // var box = new BABYLON.MeshBuilder.CreateBox(
    //     "mybox",
    //     { size: 3, width: 3, height: 3, depth: 3 },
    //     scene
    // );
    // box.material = mat0;

    var mat3 = new BABYLON.StandardMaterial("mat", scene);
    mat3.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.4);
    mat3.wireframe = true;

    var ground = new BABYLON.MeshBuilder.CreateGround("", {
        width: 10,
        height: 10,
        subdivisions: 10,
    });
    ground.material = mat3;

    //
    var light = new BABYLON.HemisphericLight(
        "light2",
        new BABYLON.Vector3(10, 10, 10),
        scene
    );

    //
    await readClipboardFunction(scene);
    await selectObjects(scene);
    // await showSearchProperties();

    console.log("selected mesh:", SELECTED_MESH_ARR.length);

    //
    scene.registerBeforeRender(() => {});

    //
    return scene;
};

async function showSearchProperties() {
    let x = document.getElementById("searchdiv");
    if (SELECTED_MESH_ARR.length > 0) {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

async function readClipboardFunction(scene) {
    //
    var mat1 = new BABYLON.StandardMaterial("mat1", scene);
    mat1.diffuseColor = new BABYLON.Color3(1, 1, 0);
    //
    MESH_ARR = [];
    SELECTED_MESH_ARR = [];
    //
    readClipboardBtn.addEventListener("click", async () => {
        const res = await api.readClipboard();
        var count = 0;
        api.readClipboard()
            .then((data) => {
                data.replace("\\", " ");
                var objArr = JSON.parse(data);
                objArr.forEach((obj) => {
                    positionArr = [];
                    indexArr = [];
                    let verts = obj.vertices;
                    verts.forEach((v) => {
                        positionArr.push(v.x);
                        positionArr.push(v.z);
                        positionArr.push(v.y);
                    });
                    let faces = obj.faces;
                    faces.forEach((f) => {
                        indexArr.push(f.a);
                        indexArr.push(f.b);
                        indexArr.push(f.c);
                    });
                    let name = "mesh" + count;
                    var customMesh = new BABYLON.Mesh(name, scene);
                    var positions = positionArr;
                    var indices = indexArr;
                    var normals = [];
                    BABYLON.VertexData.ComputeNormals(
                        positions,
                        indices,
                        normals
                    );
                    var vertexData = new BABYLON.VertexData();
                    vertexData.positions = positions;
                    vertexData.indices = indices;
                    vertexData.normals = normals;
                    vertexData.applyToMesh(customMesh, true);
                    customMesh.material = mat1;
                    MESH_ARR.push(customMesh);
                    dataArr.push(obj.property_set);
                    count++;
                });
            })
            .catch((err) => {
                console.log(err);
            });
    });
}

async function selectObjects(scene) {
    //
    var mat1 = new BABYLON.StandardMaterial("mat1", scene);
    mat1.diffuseColor = new BABYLON.Color3(1, 1, 0);

    //
    const selectMat = new BABYLON.StandardMaterial();
    selectMat.diffuseColor = new BABYLON.Color3(1, 0, 0);
    selectMat.specularColor = new BABYLON.Color3(1, 1, 0);

    scene.onPointerDown = async function castray() {
        const hit = scene.pick(scene.pointerX, scene.pointerY);
        var n = MESH_ARR.length;
        let i = 0;
        let reqName = "";
        //
        var div = document.getElementById("infodiv");
        while (div.hasChildNodes()) {
            div.firstChild.remove();
        }
        while (i < n) {
            let name = "mesh" + i;
            if (hit.pickedMesh && hit.pickedMesh.name == name) {
                reqName = name;
                dataArr[i].forEach((e) => {
                    var s = e.param + " : " + e.value;
                    var p = document.createElement("p");
                    p.innerHTML = s;
                    div.appendChild(p);
                });
            }
            i++;
        }

        //
        let tempSelectedArr = [];
        MESH_ARR.forEach((e) => {
            if (e.name === reqName) {
                e.material = selectMat;
                tempSelectedArr.push(e);
            } else {
                e.material = mat1;
            }
        });
        SELECTED_MESH_ARR = [...tempSelectedArr];
        await showSearchProperties();
    };
}

const scene = await createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener("resize", () => {
    engine.resize();
});
