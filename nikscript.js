publiccode = '\nvar i = 0; var float = 2.9;\n var x = i + 20;\n i += 1;\nvar t = \"abc\";\nif (i==2){print(i*2)}' 
toks = lexer(publiccode)

for(i=0;i<toks.length;i++){
    print("["+ toks[i] +"]")
}

print(publiccode)

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
        else if(c.match(/[\(\)\{\}\[\],=]/)) {
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
                tokens.push(["expression",term])
            }
            else{
                tokens.push(["name",term])
            }
            index -= 1 //prevent loosing data
        }
        
        //print(index)	
    }
    return tokens
}