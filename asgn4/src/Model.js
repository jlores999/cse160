class Model {
    constructor(gl, filePath) {
        this.filePath = filePath;
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.normalMatrix = new Matrix4();
        this.textureNum = -2;
        this.isFullyLoaded = false;
        this.gl = gl;
        this.vertexBuffer = null;
        this.normalBuffer = null;
        this.vertexCount = 0;
        this.getFileContent();
    }
    
    async parseModel(fileContent) {
        const lines = fileContent.split("\n");
        const allVertices = [];
        const allNormals = [];
        const unpackedVerts = [];
        const unpackedNormals = [];
        
        for (let i = 0; i < lines.length; i++){
            const line = lines[i].trim();
            if (!line || line[0] === '#') continue;
            const tokens = line.split(/\s+/);
            
            if (tokens[0] == 'v'){
                allVertices.push(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
            }
            else if (tokens[0] == 'vn'){
                allNormals.push(parseFloat(tokens[1]), parseFloat(tokens[2]), parseFloat(tokens[3]));
            }
            else if (tokens[0] == 'f'){
                for(const face of [tokens[1], tokens[2], tokens[3]]){
                    const indices = face.split("//");
                    const vertexIndex = (parseInt(indices[0]) - 1) * 3;
                    const normalIndex = (parseInt(indices[1]) - 1) * 3;
                    unpackedVerts.push(allVertices[vertexIndex], allVertices[vertexIndex+1], allVertices[vertexIndex+2]);
                    unpackedNormals.push(allNormals[normalIndex], allNormals[normalIndex+1], allNormals[normalIndex+2]);
                }
            }
        }
        
        const vertices = new Float32Array(unpackedVerts);
        const normals = new Float32Array(unpackedNormals);
        this.vertexCount = vertices.length / 3;
        
        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW);
        
        this.normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, normals, this.gl.STATIC_DRAW);
        
        this.isFullyLoaded = true;
    }
    
    render() {
        if (!this.isFullyLoaded) return;

        gl.uniform1i(u_whichTexture, this.textureNum);
        
        gl.disableVertexAttribArray(a_UV);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Normal);
        
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
        gl.uniform4fv(u_FragColor, this.color);
        
        this.normalMatrix.setInverseOf(this.matrix);
        this.normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, this.normalMatrix.elements);
        
        gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    }
    
    async getFileContent() {
        const response = await fetch(this.filePath);
        const fileContent = await response.text();
        await this.parseModel(fileContent);
    }
}

