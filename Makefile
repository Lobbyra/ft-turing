all	:
	dune build
	mv -f _build/default/bin/main.exe .

run : all
	./main.exe

clean :
	rm ./main.exe
