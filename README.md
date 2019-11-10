# Nikscript

Nikscript is a programming language written in JavaScript.
It's inspired by JavaScript (variables) and Python (# for comments) but also has some language specific syntax like its for loops: for (i = lowerLimit < upperLimit).

## Usage

This Repository contains an interpreter for Nikscript that can be used on any website.
All you need to do is to import nikscript.js inside your html page as follows:

<script src="nikscript.js"></script>

And run the interpreter by executing the interpret function whilst giving the code to execute as its parameter.

## Syntax

### Variables:

var i = 0;

### Comments

#comment

### If-Conditions

if (condition){
  code;
}

### For-loops

for (i = lowerLimit < upperLimit){
  code;
}

### While-loops

while (condition){
  code;
}

### Defining Functions

func name (arguments){
  code;
}

### Executing Functions

name(arguments);

### Returning Values From Functions

return value;

### Predefined functions

1. print(value);
2. len(string);  #returns length of a string

## Contributors

Niklas Ziermann

## Copyright & License

**© Niklas Ziermann** 

**MIT License**
