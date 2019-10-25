	publiccode = '\nvar i = 0; var float = 2.9;\n var x = i + 20;\n i += 1;\nvar t = \"abc\";\nfor (i==5){print(i*2);}'
 




publiccode = "for (i=0<2){1+1;}"
toks = lexer(publiccode)
//print(toks)

tree = parser(toks,0,"code","END")
print(tree[0])
//print("t")
//print(tree)
//print(publiccode)

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
            //print("semi")
            tokens.push([c,""])
        }
        
        else if (c == "+" || c== "-" || c == "/" || c=="*"|| c=="%"){
            //sprint(("operator",c))
            if (code[index + 1] =="="){
                index +=1
                c +="="
            }
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
            //print(s)
            tokens.push(["string",s])
        }	
        
        //else if (c == "(" || c== ")" || c == "[" || c=="]"|| c=="{"||c=="}"|| c==","){
        else if(c.match(/[\<\>\(\)\{\}\[\],=]/)) {
            //print((c,""))
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
            //print(n)
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
            //print(term)
            if (term=="if"||term=="else"||term=="for"||term=="while"){
                tokens.push(["statement",term])
            }
            else{
                tokens.push(["name",term])
            }
            index -= 1 //prevent loosing data
        }
        
        //print(index)
	
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
			    returnsymbol = ")"
			    result.push(token)
		  }
		
    	print(type)
     print("token:"+token)
    	if (type == "operation" && token[0] == ")"){	//special case because 2 things end operations
    		break
    	}
		
		  else if (token[0] == "statement"){
			   statement_type = token[1]
				  print("state")
				  cond = parser(tokens,index+1,"condition","{")
				  ifTrue = parser(tokens, cond[1]+1, "ifTrue", "}")
				  index = ifTrue[1] 
				  ifFalse = []
				  if (tokens[ifTrue[1]][1] == "else"){
					  ifFalse = parser(tokens,ifTrue[1]+1,"ifFalse","}")
					  index = ifFalse[1]
				  }
				  result.push(["statement",[statement_type,[["condition",cond[0]], ["ifTrue", ifTrue[0]], ["ifFalse",ifFalse[0]]]]])
				
			  } 

    	else if (tokens[index+1][0] == "operator" && type != "operation"){
    		data = parser(tokens,index,"operation",";")
    		result.push(["operation", data[0]])
    		index = data[1]-1
    	}

    	else if (token[0] == "number" || token[0] == "string" || token[0] == "operator" || token[0]=="="){
    		result.push(token)
    	}
    	
    	else if(token[0] == "name"){
    		if(token[1] == "var"){
    			data = parser(tokens,index+1,"assignment",";")
    			result.push(["assignment", data[0]])
    			index = data[1]-1
    		}
    		
    		else if (tokens[index+1][0] == "=" && type != "assignment" && type != "comparison"){
    			if (tokens[index+2][0] == "=" && type != "comparison"){
					  data = parser(tokens,index,"comparison",")")
    				result.push(["comparison",data[0]])
					  index = data[1]
    			}
    			else{

    				data = parser(tokens,index,"assignment",";")
    				result.push(["assignment", data[0]])
    				index = data[1]-1
    			}
    		}

    		else if (tokens[index+1][0] == "("  && type != "call"){
    			data = parser(tokens,index+1,"call",";")
    			result.push(["call", [token[1], data[0]]])
    			index = data[1]-1
    		}
			
			  
    		
    		else{
    			result.push(token)
    		}
    	}


    	index+=1
    	token = tokens[index]
    }
    return [result, index]

	
}

