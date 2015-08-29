function MatrixStack()
{
    this.top = mat4.create();
    this.stack = [];
}

MatrixStack.prototype.push = function()
{
    var copy = mat4.create();
    mat4.set(this.top, copy);
    this.stack.push(copy);
}

MatrixStack.prototype.pop = function()
{
    if(this.stack.length == 0) {
        throw "Too many calls to MatrixStack.pop()";
    }
    this.top = this.stack.pop();
}

MatrixStack.prototype.getTop = function()
{
    return this.top;
}
