"use strict";

var gl;                 // The webgl context.

var a_coords_loc;       // Location of the a_coords attribute variable in the shader program.
var a_coords_buffer;    // Buffer to hold the values for a_coords.
var a_normal_loc;       // Location of a_normal attribute.
var a_normal_buffer;    // Buffer for a_normal.
var index_buffer;       // Buffer to hold vetex indices from model.

var u_diffuseColor;     // Locations of uniform variables in the shader program
var u_specularColor;
var u_specularExponent;
var u_lightPosition;
var u_modelview;
var u_projection;
var u_normalMatrix;    

var projection = mat4.create();          // projection matrix
var modelview;                           // modelview matrix; value comes from rotator
var normalMatrix = mat3.create();        // matrix, derived from model and view matrix, for transforming normal vectors
var rotator;                             // A TrackballRotator to implement rotation by mouse.

var lastTime = 0;
var colors = [  // RGB color arrays for diffuse and specular color values
    [1,1,1],
];

var lightPositions = [  // values for light position
  [0,0,0,1],
];

var objects = [         // Objects for display
    chair(),table(), cube(),
];

var currentModelNumber;  // contains data for the current object

function degToRad(degrees) {
  return degrees * Math.PI / 180;
}


function perspective(out, fovy, aspect, near, far//TODO: function inputs
    ){

    if (document.getElementById("my_gl").checked) {
         /*
        TODO: Your code goes here.
        Write the code to perform perspective transformation. 
        Think about what would be the input and output to the function would be
        */
        let f = 1.0 / Math.tan(fovy / 2);
        let nf = 1 / (near - far);
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[10] = (far + near) * nf;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[14] = (2 * far * near) * nf;
        out[15] = 0;
        return out;
    }
    else {
        mat4.perspective(out,fovy,aspect,near,far);   
        /*
        TODO: Your code goes here.
        use inbuilt_gl functions to perform perspective projection
        */ 
    }  
}

function translate(m1,m2,v//TODO: function inputs
    ){

    if (document.getElementById("my_gl").checked) {
        /*
        TODO: Your code goes here.
        Write the code to perform translation transformation. 
        Think about what would be the input and output to the function would be
        */
        m1[12] = m2[0]*v[0] + m2[4]*v[1] + m2[8]*v[2] + m2[12];
        m1[13] = m2[1]*v[0] + m2[5]*v[1] + m2[9]*v[2] + m2[13];
        m1[14] = m2[2]*v[0] + m2[6]*v[1] + m2[10]*v[2] + m2[14];
        m1[15] = m2[3]*v[0] + m2[7]*v[1] + m2[11]*v[2] + m2[15];
    }
    else {
        /*
        TODO: Your code goes here.
        use inbuilt_gl functions to perform translation
        */
        mat4.translate(m1,m2,v);   
    }  
}

function rotate(m1,m2,r,v//TODO: function inputs
    ){

    if (document.getElementById("my_gl").checked) {
        /*
        TODO: Your code goes here.
        Write the code to perform rotation about ARBITARY axis.
        Note: One of the input to this function would be axis vector around which you would rotate. 
        Think about what would be the input and output to the function would be
        */
        var l = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]);
        var A = [[m2[0],m2[1],m2[2],m2[3]],
                 [m2[4],m2[5],m2[6],m2[7]],
                 [m2[8],m2[9],m2[10],m2[11]]];
        var B = [[v[0]*v[0]*(1-Math.cos(r))+Math.cos(r),
                  v[1]*v[0]*(1-Math.cos(r))+v[2]*Math.sin(r),
                  v[2]*v[0]*(1-Math.cos(r))-v[1]*Math.sin(r)],
                 [v[0]*v[1]*(1-Math.cos(r))-v[2]*Math.sin(r),
                  v[1]*v[1]*(1-Math.cos(r))+Math.cos(r),
                  v[2]*v[1]*(1-Math.cos(r))+v[0]*Math.sin(r)],
                 [v[0]*v[2]*(1-Math.cos(r))+v[1]*Math.sin(r),
                  v[1]*v[2]*(1-Math.cos(r))-v[0]*Math.sin(r),
                  v[2]*v[2]*(1-Math.cos(r))+Math.cos(r)]];
        m1[0] = A[0][0]*B[0][0] + A[1][0]*B[0][1] + A[2][0]*B[0][2];
        m1[1] = A[0][1]*B[0][0] + A[1][1]*B[0][1] + A[2][1]*B[0][2];
        m1[2] = A[0][2]*B[0][0] + A[1][2]*B[0][1] + A[2][2]*B[0][2];
        m1[3] = A[0][3]*B[0][0] + A[1][3]*B[0][1] + A[2][3]*B[0][2];

        m1[4] = A[0][0]*B[1][0] + A[1][0]*B[1][1] + A[2][0]*B[1][2];
        m1[5] = A[0][1]*B[1][0] + A[1][1]*B[1][1] + A[2][1]*B[1][2];
        m1[6] = A[0][2]*B[1][0] + A[1][2]*B[1][1] + A[2][2]*B[1][2];
        m1[7] = A[0][3]*B[1][0] + A[1][3]*B[1][1] + A[2][3]*B[1][2];

        m1[8] = A[0][0]*B[2][0] + A[1][0]*B[2][1] + A[2][0]*B[2][2];
        m1[9] = A[0][1]*B[2][0] + A[1][1]*B[2][1] + A[2][1]*B[2][2];
        m1[10] = A[0][2]*B[2][0] + A[1][2]*B[2][1] + A[2][2]*B[2][2];
        m1[11] = A[0][3]*B[2][0] + A[1][3]*B[2][1] + A[2][3]*B[2][2];
    }
    else {
        mat4.rotate(m1,m2,r,v);
        /*
        TODO: Your code goes here.
        use inbuilt_gl functions to perform rotation
        */   
    } 
    return m1;

}

function scale(m1,m2,v//TODO: function inputs
    ){

    if (document.getElementById("my_gl").checked) {
        /*
        TODO: Your code goes here.
        Write the code to perform scale transformation. 
        Think about what would be the input and output to the function would be
        */
        m1[0] = m2[0] * v[0];
        m1[1] = m2[1] * v[0];
        m1[2] = m2[2] * v[0];
        m1[3] = m2[3] * v[0];
        m1[4] = m2[4] * v[1];
        m1[5] = m2[5] * v[1];
        m1[6] = m2[6] * v[1];
        m1[7] = m2[7] * v[1];
        m1[8] = m2[8] * v[2];
        m1[9] = m2[9] * v[2];
        m1[10] = m2[10] * v[2];
        m1[11] = m2[11] * v[2];
        m1[12] = m2[12];
        m1[13] = m2[13];
        m1[14] = m2[14];
        m1[15] = m2[15];
    }
    else {
        mat4.scale(m1,m2,v)
        /*
        TODO: Your code goes here.
        use inbuilt_gl functions to perform scaling
        */   
    } 
    return m1;
}



function draw() { 
    gl.clearColor(0.15,0.15,0.3,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    perspective(projection,Math.PI/5,1,10,20);   
    modelview = rotator.getViewMatrix();

    mat4.translate(modelview,modelview,[0,0,-2]);

    // draw the 1st chair , object[0]
    installModel(objects[0]);
    currentModelNumber = 0;
    
    /*
    TODO: Your code goes here. 
    Compute all the necessary transformation to align object[0] (chair)
    Use your own functions with the proper inputs i.e
        1. translate()
        2. scale()
        3. rotate()
    Apply those transformation to the modelview matrix.
    Not all the transformations are relative and they keep on adding as you modify modelview. 
    Hence, you might want to reverse the previous transformation. Keep in mind the order
    in which you apply transformation.
    */    

    translate(modelview,modelview,[0.5,0,0]);    
    rotate(modelview,modelview,degToRad(90),[0,1,0]);
    update_uniform(modelview,projection, 0);


    // draw the 2nd chair , object[0]
    installModel(objects[0]);
    currentModelNumber = 0;

    //TODO: Your code goes here.
    translate(modelview,modelview,[-1.5,0,-2.5]);
    rotate(modelview,modelview,degToRad(90),[0,1,0]);
    // mat4.rotate(modelview,modelview,degToRad(90),[0,1,0]);
    update_uniform(modelview,projection, 0);


    // draw the 3rd chair , object[0]
    installModel(objects[0]);
    currentModelNumber = 0;

    //TODO: Your code goes here. 
    translate(modelview,modelview,[-1,0,-3]);
    rotate(modelview,modelview,degToRad(90),[0,1,0]);
    update_uniform(modelview,projection, 0);


    // draw the 4th chair , object[0]
    installModel(objects[0]);
    currentModelNumber = 0;

   //TODO: Your code goes here. 
    translate(modelview,modelview,[-1.5,0,-2.5])
    rotate(modelview,modelview,degToRad(90),[0,1,0]);
    update_uniform(modelview,projection, 0);
    

    // draw the Table , object[1]
    installModel(objects[1]);
    currentModelNumber = 1;

   //TODO: Your code goes here. 
    translate(modelview,modelview,[-1.7,0.5,-0.8]);
    update_uniform(modelview,projection, 1);
    

    // draw the Cube , object[2]
    installModel(objects[2]);
    currentModelNumber = 2;

   //TODO: Your code goes here. 
    translate(modelview,modelview,[-0.2,0.1,-0.1]);
    update_uniform(modelview,projection, 2);


}

/*
  this function assigns the computed values to the uniforms for the model, view and projection 
  transform
*/
function update_uniform(modelview,projection,currentModelNumber){

    /* Get the matrix for transforming normal vectors from the modelview matrix,
       and send matrices to the shader program*/
    mat3.normalFromMat4(normalMatrix, modelview);
    
    gl.uniformMatrix3fv(u_normalMatrix, false, normalMatrix);
    gl.uniformMatrix4fv(u_modelview, false, modelview );
    gl.uniformMatrix4fv(u_projection, false, projection );   
    gl.drawElements(gl.TRIANGLES, objects[currentModelNumber].indices.length, gl.UNSIGNED_SHORT, 0);
}



/* 
 * Called and data for the model are copied into the appropriate buffers, and the 
 * scene is drawn.
 */
function installModel(modelData) {
     gl.bindBuffer(gl.ARRAY_BUFFER, a_coords_buffer);
     gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
     gl.vertexAttribPointer(a_coords_loc, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(a_coords_loc);
     gl.bindBuffer(gl.ARRAY_BUFFER, a_normal_buffer);
     gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
     gl.vertexAttribPointer(a_normal_loc, 3, gl.FLOAT, false, 0, 0);
     gl.enableVertexAttribArray(a_normal_loc);
     gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,index_buffer);
     gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
}


/* Initialize the WebGL context.  Called from init() */
function initGL() {
    var prog = createProgram(gl,"vshader-source","fshader-source");
    gl.useProgram(prog);
    a_coords_loc =  gl.getAttribLocation(prog, "a_coords");
    a_normal_loc =  gl.getAttribLocation(prog, "a_normal");
    u_modelview = gl.getUniformLocation(prog, "modelview");
    u_projection = gl.getUniformLocation(prog, "projection");
    u_normalMatrix =  gl.getUniformLocation(prog, "normalMatrix");
    u_lightPosition=  gl.getUniformLocation(prog, "lightPosition");
    u_diffuseColor =  gl.getUniformLocation(prog, "diffuseColor");
    u_specularColor =  gl.getUniformLocation(prog, "specularColor");
    u_specularExponent = gl.getUniformLocation(prog, "specularExponent");
    a_coords_buffer = gl.createBuffer();
    a_normal_buffer = gl.createBuffer();
    index_buffer = gl.createBuffer();
    gl.enable(gl.DEPTH_TEST);
    gl.uniform3f(u_specularColor, 0.5, 0.5, 0.5);
    gl.uniform4f(u_diffuseColor, 1, 1, 1, 1);
    gl.uniform1f(u_specularExponent, 10);
    gl.uniform4f(u_lightPosition, 0, 0, 0, 1);
}

/* Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program.  If an error occurs while compiling or
 * linking the program, an exception of type String is thrown.  The error
 * string contains the compilation or linking error.  If no error occurs,
 * the program identifier is the return value of the function.
 *    The second and third parameters are the id attributes for <script>
 * elementst that contain the source code for the vertex and fragment
 * shaders.
 */
function createProgram(gl, vertexShaderID, fragmentShaderID) {
    function getTextContent( elementID ) {
            // This nested function retrieves the text content of an
            // element on the web page.  It is used here to get the shader
            // source code from the script elements that contain it.
        var element = document.getElementById(elementID);
        var node = element.firstChild;
        var str = "";
        while (node) {
            if (node.nodeType == 3) // this is a text node
                str += node.textContent;
            node = node.nextSibling;
        }
        return str;
    }
    try {
        var vertexShaderSource = getTextContent( vertexShaderID );
        var fragmentShaderSource = getTextContent( fragmentShaderID );
    }
    catch (e) {
        throw "Error: Could not get shader source code from script elements.";
    }
    var vsh = gl.createShader( gl.VERTEX_SHADER );
    gl.shaderSource(vsh,vertexShaderSource);
    gl.compileShader(vsh);
    if ( ! gl.getShaderParameter(vsh, gl.COMPILE_STATUS) ) {
        throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
     }
    var fsh = gl.createShader( gl.FRAGMENT_SHADER );
    gl.shaderSource(fsh, fragmentShaderSource);
    gl.compileShader(fsh);
    if ( ! gl.getShaderParameter(fsh, gl.COMPILE_STATUS) ) {
       throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
    }
    var prog = gl.createProgram();
    gl.attachShader(prog,vsh);
    gl.attachShader(prog, fsh);
    gl.linkProgram(prog);
    if ( ! gl.getProgramParameter( prog, gl.LINK_STATUS) ) {
       throw "Link error in program:  " + gl.getProgramInfoLog(prog);
    }
    return prog;
}


/**
 * initialization function that will be called when the page has loaded
 */
function init() {
    try {
        var canvas = document.getElementById("myGLCanvas");
        gl = canvas.getContext("webgl") || 
                         canvas.getContext("experimental-webgl");
        if ( ! gl ) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }

    try {
        initGL();  // initialize the WebGL graphics context
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context:" + e + "</p>";
        return;
    }

    document.getElementById("my_gl").checked = false;
    document.getElementById("my_gl").onchange = draw;
    rotator = new TrackballRotator(canvas, draw, 15);
    draw();
}







