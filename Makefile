dep:
	@bun i

all: dep checktsc
	@echo "WARNING : You need bun to build this project ! https://bun.sh/docs/installation"
	bun run build

checktsc:
	@bun run tsc
	@find ./src -name "*.js" -exec rm {} \;

clean:
	@rm -rf ./node_modules
	@rm -rf ft-turing

re: clean all
