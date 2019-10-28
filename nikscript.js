function lexer(code){
    tokens=[]
    index = -1
    // Sprache nutzen um Programmierlernspiel zu machen
    
    
    while (index<code.length-1){
        index +=1
        c = code[index]
		
        if (c == " " || c == "\n"){    
            continue
        }
        
        else if (c == ";"){ 
            //console.log("semi")
            tokens.push([c,""])
        }
        
        else if (c == "+" || c== "-" || c == "/" || c=="*"|| c=="%"){
            tokens.push(["operator",c])
        }
            
        else if (c == "\""){
		
	
            s = ""
            index +=1
            c = code[index]
		
            while (c != "\""){
                s += c
                index +=1
                c = code[index]
		
            }
            //console.log(s)
            tokens.push(["string",s])
        }	
        
        //else if (c == "(" || c== ")" || c == "[" || c=="]"|| c=="{"||c=="}"|| c==","){
        else if(c.match(/[\<\>\(\)\{\}\[\],=]/)) {
            //console.log((c,""))
            tokens.push([c,""])
        }
        
        else if (c.match(/[0-9]/)){
            n = c
            index +=1
            c = code[index]
		
            while (c.match(/[0-9\.]/)){
                n += c
                index +=1
                c = code[index]
		
            }
            //console.log(n)
            tokens.push(["number",n])
            index -= 1 //prevent loosing data
        }
        
        if (c.match(/[a-zA-Z]/)){
            term = c
            index +=1
            c = code[index]
		
            //while (c.match(/[^\s()[]{},]/)){
            while (c.match(/[a-zA-Z0-9_-]/)){
                term += c
                index +=1
                c = code[index]
		
            }
            //console.log(term)
            if (term=="if"||term=="else"||term=="for"||term=="while"){
                tokens.push(["statement",term])
            }
            else{
                tokens.push(["name",term])
            }
            index -= 1 //prevent loosing data
        }
        
        //console.log(index)
	
    }
    tokens.push(["END","END"])
    return tokens
	
}

function parser(tokens,index,type,returnsymbol){//recursive; in if statements etc the returnsymbol is "}"
    // need to add < and >
	var result = []
    var token = tokens[index]
    while (token[0] != returnsymbol){
		
		if (type == "assignment" && (token[0] == "<" || token[0] == ">")){ // temporary
			    break
		}

    	else if (type == "operation" && (token[0] == ")" || token[0] == "="|| token[0] == "<"|| token[0] == ">"|| token[0] == ",")){	//special case because multiple things end operations
    		break
    	}
		
		else if (token[0] == "statement"){
			//console.log(token)
			var statement_type = token[1]
			var cond = parser(tokens,index+2,"condition","{")
			var ifTrue = parser(tokens, cond[1]+1, "ifTrue", "}")
			index = ifTrue[1] 
			var ifFalse = []
			if (tokens[ifTrue[1]+1][1] == "else"){
				ifFalse = parser(tokens,ifTrue[1]+2,"ifFalse","}")
			 	index = ifFalse[1]
			}
			result.push(["statement",[statement_type,[["condition",cond[0]], ["ifTrue", ifTrue[0]], ["ifFalse",ifFalse[0]]]]])	
			//console.log(result)
		} 


    	else if (tokens[index+1][0] == "operator" && type != "operation"){
    		data = parser(tokens,index,"operation",";")
    		result.push(["operation", data[0]])
    		index = data[1]-1
    	}

    	else if (token[0] == "number" || token[0] == "string" || token[0] == "operator" || token[0]=="="|| token[0]=="<"|| token[0]==">"){
    		result.push(token)
    	}
    	
    	else if(token[0] == "name"){
    		
    		if(token[1] == "var"){
    			data = parser(tokens,index+1,"assignment",";")
    			result.push(["assignment", data[0]])
    			index = data[1]-1
    		}

    		else if(token[1] == "func"){
    			var funcName = tokens[index+1][1]
    			var inputVars = parser(tokens,index+3,"input","{")
    			index = inputVars[1]
    			var funcContent = parser(tokens,index+1,"input","}")
    			index = funcContent[1]
    			result.push(["function", [funcName, [["input", inputVars], ["content", funcContent]] ]])
    			//data = parser(tokens,index+1,"assignment",";")
    			//result.push(["assignment", data[0]])
    			//index = data[1]-1
    		}
    		
    		else if (tokens[index+1][0] == "=" && type != "assignment" && type != "comparison"){
    			
    			if (tokens[index+2][0] == "="){
					if (type == "condition"){
						result.push(token)
					}
					else{
						data = parser(tokens,index,"comparison",")")
	    				result.push(["comparison",data[0]])
						index = data[1]
					}
    			}

    			else{

    				data = parser(tokens,index,"assignment",";")
    				result.push(["assignment", data[0]])
    				index = data[1]-1
    			}
    		}

    		else if (tokens[index+1][0] == "("){
    			
    			data = parser(tokens,index+2,"call",";")
    			result.push(["call", [token[1], data[0]]])
    			index = data[1]-1
    		}
		
    		else{
    			result.push(token)
    		}
    	}
    	
    	else if (token[0] == "("){
    		data = parser(tokens,index+1,"bracket",")")
    		result.push(["bracket", data[0]])
    		index = data[1]
    	}

    	//console.log(type)
    	index+=1
    	token = tokens[index]
    }
    return [result, index]

	
}

function interpreter(exprs){
	
	var index = 0
	
	while (index < exprs.length){

		var expr = exprs[index]
		if (expr[0] == "number"){
			return parseFloat(expr[1])
		}

		else if (expr[0] == "string"){
			return expr[1]
		}

		else if (expr[0] == "name"){
			if (functionStack.length==0)
				return vars[expr[1]]
			else
				return functionStack[functionStack.length-1][1][expr[1]]
		}

		else if (expr[0] == "assignment"){
			var c = interpreter([expr[1][2]])
			if (functionStack.length == 0)
				vars[expr[1][0][1]] = c;
			else
				functionStack[functionStack.length-1][1][expr[1][0][1]] = c;
		}
		
		else if (expr[0] == "call"){
			
			var content = expr[1]

			if (content[0]+"()" in functions){ // functioncall for selvedefined function
				
				var functionContent = functions[content[0]+"()"]
				var argsNeeded = functionContent[0][1][0]
				var argsGiven = content[1]

				if (argsGiven.length == argsNeeded.length){ 
					//console.log(functionStack)

					var tempFunctionStack = [] // used so that no values get mixed up in for loop below (values would be taken from newest function in stack)

					tempFunctionStack.push([content[0]+"()", {}])

					for (var i = 0; i < argsGiven.length; i++){
						tempFunctionStack[tempFunctionStack.length-1][1][argsNeeded[i][1]] = interpreter([argsGiven[i]]) // save function input arguments as variables
					}


					functionStack.push(tempFunctionStack[0])
					

					returnValue = interpreter(functionContent[1][1][0])

					//console.log(functionStack[functionStack.length-1][1])
					functionStack.pop()


				}
				
				else{
					console.log(argsNeeded)
					console.log("given " + argsGiven)
					console.log(content[0] + " takes " + argsNeeded.length + " arguments but " + argsGiven.length + " were given!")
				}
			}
			
			else{ //predefinded function?
				switch(content[0]){ 
					case "print":
						console.log(interpreter(content[1]))
						break
					
					case "len":
						return interpreter(content[1]).length
					
					default:
						console.log("function \"" + content[0] + "\" undefined")
				}
			}
		}

		else if(expr[0] == "operation"){
			
			var content = expr[1]
			var res = interpreter([content[0]])
			
			for (var i=1;i<content.length;i+=2){

				switch(content[i][1]){
					case "+":
						res += interpreter([content[i+1]])
						break
					case "-":
						res -= interpreter([content[i+1]])
						break
					case "*":
						res *= interpreter([content[i+1]])
						break
					case "%":
						res = res % interpreter([content[i+1]])
						break
				}
			}
			return res
		}

		else if(expr[0] == "statement"){
			
			switch(expr[1][0]){
				
				case "if":
					
					if (interpreter([expr[1][1][0]])){ 	// condition
						interpreter(expr[1][1][1][1]) 	// ifTrue
					}
					
					else{
						if (expr[1][1][2][1] != undefined){
							interpreter(expr[1][1][2][1])	// ifFalse
						}
					}
					break

				case "while":
					while (interpreter([expr[1][1][0]])){
						interpreter(expr[1][1][1][1])
					}

				case "for":

					var condition = expr[1][1][0][1]

					var loopVarExpr = condition[0][1][0]
					var startValue = interpreter([condition[0][1][2]])
					var limit = interpreter([condition[2]])
					var loopCode = expr[1][1][1][1]

					if (condition[1][0] == "<"){
						if(functionStack.length == 0){ // not inside a function
							for (vars[loopVarExpr[1]]=startValue; vars[loopVarExpr[1]] < limit; vars[loopVarExpr[1]]++){
								interpreter(loopCode)
							}
						}
						else{
							for (functionStack[functionStack.length-1][1][loopVarExpr[1]]=startValue; functionStack[functionStack.length-1][1][loopVarExpr[1]] < limit; functionStack[functionStack.length-1][1][loopVarExpr[1]]++){
								interpreter(loopCode)
							}
						}
					}

					else if (condition[1][0] == ">"){
						if(functionStack.length == 0){ // not inside a function
							for (vars[loopVarExpr[1]]=startValue; vars[loopVarExpr[1]] > limit; vars[loopVarExpr[1]]++){
								interpreter(loopCode)
							}
						}
						else{
							for (functionStack[functionStack.length-1][1][loopVarExpr[1]]=startValue; functionStack[functionStack.length-1][1][loopVarExpr[1]] > limit; functionStack[functionStack.length-1][1][loopVarExpr[1]]++){
								interpreter(loopCode)
							}
						}
					}
			}
		}

		else if(expr[0] == "condition" || expr[0] == "comparison"){
			
			var content = expr[1]
			switch(content[1][0]){ // type of comparison
				case "=":

					if (interpreter([content[0]]) == interpreter([content[3]])){
						
						return true
					}

					else{
						return false
					}

				case "<":
					if (interpreter([content[0]]) < interpreter([content[2]])){
						return true
					}

					else{
						return false
					}

				case ">":
					if (interpreter([content[0]]) > interpreter([content[2]])){
						return true
					}

					else{
						return false
					}
			}
		}

		else if(expr[0] == "bracket"){
			return interpreter(expr[1])
		}

		else if(expr[0] == "function"){ // store defined function
			var content = expr[1]
			var functionname = content[0] + "()"
			var functiondata = content[1]
			
			functions[functionname] = functiondata
		}

		index+=1
	}
}


function interpret(code){
	functions = {} // seperate from vars because it doesnt have a local scope
	vars = {}
	functionStack = [] //local variables and return statements dont exist for now

	console.log(parser(lexer(code),0,"code","END")[0])
	interpreter(parser(lexer(code),0,"code","END")[0])
}

var FizzBuzz = "for(i=1<101){tmp = \"\";if(i%3==0){tmp = tmp + \"Fizz\";}if(i%5==0){tmp = tmp + \"Buzz\";}if(tmp==\"\"){tmp=i;}print(tmp);}"
