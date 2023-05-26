let cCode = "";
let uCode = "";

const event = require("events");
const util = {
    log: (text) => {
        uCode += `printf("${text}");\n    `;
    },
    execute: (code) => {
        uCode += `${code}\n    `;
    },
    clear: () => {
        uCode += 'printf("\e[1;1H\e[2J");\n    '
    },
    color: {
        RED:     "\\x1b[31m",
        GREEN:   "\\x1b[32m",
        YELLOW:  "\\x1b[33m",
        WHITE: "\\x1b[39m",
    }
} || "Wii<Utilites>"  
class App {
  Import = function (importModule) {
    cCode += `#include <${importModule}.h>\n`;
    return true;
  };
  Init = function () {
    cCode += `static void *xfb = NULL;
static GXRModeObj *rmode = NULL;

void Initialise() {
  
	VIDEO_Init();
	WPAD_Init();
  
	
	rmode = VIDEO_GetPreferredMode(NULL);

	xfb = MEM_K0_TO_K1(SYS_AllocateFramebuffer(rmode));
	console_init(xfb,20,20,rmode->fbWidth,rmode->xfbHeight,rmode->fbWidth*VI_DISPLAY_PIX_SZ);
 
	VIDEO_Configure(rmode);
	VIDEO_SetNextFramebuffer(xfb);
	VIDEO_SetBlack(FALSE);
	VIDEO_Flush();
	VIDEO_WaitVSync();
	if(rmode->viTVMode&VI_NON_INTERLACE) VIDEO_WaitVSync();
}\n\n`;
  };
  Function = function(fncName, params, {
     C: code
    }) {
    if(!fncName) {
        throw new Error("Error, missing type, params or code")
    }
    if(!fncName) {
        throw new Error("Error, missing type, params or code")
    }
    cCode += `void ${fncName}(${params}) {
        ${code}
}\n\n`
  }
  Main = function (callback) {
    callback();
    cCode += `int main() {
    Initialise();
    ${uCode}
    return 0;
}`
  }
  Compile = function({
    libogc_path: libogcpath,
    output_path: outputpath
  }) {
    console.log(process.env.DEVKITPRO)
    if(!process.env.DEVKITPRO) {
      console.log(`\x1b[31mCompiler Error\x1b[0m - Missing devkitpro, please install it, or if you have alredy installed: check your environments variables`)
      require('child_process').exec("./downloads_/devkitProUpdater-3.0.3.exe")
      return;
    }
    let libogc = libogcpath;
    console.log("\x1b[34mCompiler\x1b[0m - Starting compiling ...")
    if(!libogc) { throw new Error("Missing libogc path") }
    let Makefile = `#---------------------------------------------------------------------------------
    # Clear the implicit built in rules
    #---------------------------------------------------------------------------------
    .SUFFIXES:
    #---------------------------------------------------------------------------------
    ifeq ($(strip $(DEVKITPPC)),)
    $(error "Please set DEVKITPPC in your environment. export DEVKITPPC=<path to>devkitPPC")
    endif
    
    include $(DEVKITPPC)/wii_rules
    
    #---------------------------------------------------------------------------------
    # TARGET is the name of the output
    # BUILD is the directory where object files & intermediate files will be placed
    # SOURCES is a list of directories containing source code
    # INCLUDES is a list of directories containing extra header files
    #---------------------------------------------------------------------------------
    TARGET		:=	$(notdir $(CURDIR))
    BUILD		:=	build
    SOURCES		:=	source
    DATA		:=	data
    INCLUDES	:=
    
    #---------------------------------------------------------------------------------
    # options for code generation
    #---------------------------------------------------------------------------------
    
    CFLAGS += -I"${libogcpath}"

    CXXFLAGS	=	$(CFLAGS)
    
    LDFLAGS	=	-g $(MACHDEP) -Wl,-Map,$(notdir $@).map
    
    #---------------------------------------------------------------------------------
    # any extra libraries we wish to link with the project
    #---------------------------------------------------------------------------------
    LIBS	:=	-lwiiuse -lbte -logc -lm
    
    #---------------------------------------------------------------------------------
    # list of directories containing libraries, this must be the top level containing
    # include and lib
    #---------------------------------------------------------------------------------
    LIBDIRS	:=
    
    #---------------------------------------------------------------------------------
    # no real need to edit anything past this point unless you need to add additional
    # rules for different file extensions
    #---------------------------------------------------------------------------------
    ifneq ($(BUILD),$(notdir $(CURDIR)))
    #---------------------------------------------------------------------------------
    
    export OUTPUT	:=	$(CURDIR)/$(TARGET)
    
    export VPATH	:=	$(foreach dir,$(SOURCES),$(CURDIR)/$(dir)) \
              $(foreach dir,$(DATA),$(CURDIR)/$(dir))
    
    export DEPSDIR	:=	$(CURDIR)/$(BUILD)
    
    #---------------------------------------------------------------------------------
    # automatically build a list of object files for our project
    #---------------------------------------------------------------------------------
    CFILES		:=	$(foreach dir,$(SOURCES),$(notdir $(wildcard $(dir)/*.c)))
    CPPFILES	:=	$(foreach dir,$(SOURCES),$(notdir $(wildcard $(dir)/*.cpp)))
    sFILES		:=	$(foreach dir,$(SOURCES),$(notdir $(wildcard $(dir)/*.s)))
    SFILES		:=	$(foreach dir,$(SOURCES),$(notdir $(wildcard $(dir)/*.S)))
    BINFILES	:=	$(foreach dir,$(DATA),$(notdir $(wildcard $(dir)/*.*)))
    
    #---------------------------------------------------------------------------------
    # use CXX for linking C++ projects, CC for standard C
    #---------------------------------------------------------------------------------
    ifeq ($(strip $(CPPFILES)),)
      export LD	:=	$(CC)
    else
      export LD	:=	$(CXX)
    endif
    
    export OFILES_BIN	:=	$(addsuffix .o,$(BINFILES))
    export OFILES_SOURCES := $(CPPFILES:.cpp=.o) $(CFILES:.c=.o) $(sFILES:.s=.o) $(SFILES:.S=.o)
    export OFILES := $(OFILES_BIN) $(OFILES_SOURCES)
    
    export HFILES := $(addsuffix .h,$(subst .,_,$(BINFILES)))
    
    #---------------------------------------------------------------------------------
    # build a list of include paths
    #---------------------------------------------------------------------------------
    export INCLUDE	:=	$(foreach dir,$(INCLUDES), -iquote $(CURDIR)/$(dir)) \
              $(foreach dir,$(LIBDIRS),-I$(dir)/include) \
              -I$(CURDIR)/$(BUILD) \
              -I$(LIBOGC_INC)
    
    #---------------------------------------------------------------------------------
    # build a list of library paths
    #---------------------------------------------------------------------------------
    export LIBPATHS	:= -L$(LIBOGC_LIB) $(foreach dir,$(LIBDIRS),-L$(dir)/lib)
    
    export OUTPUT	:=	$(CURDIR)/$(TARGET)
    .PHONY: $(BUILD) clean
    
    #---------------------------------------------------------------------------------
    $(BUILD):
      @[ -d $@ ] || mkdir -p $@
      @$(MAKE) --no-print-directory -C $(BUILD) -f $(CURDIR)/Makefile
    
    #---------------------------------------------------------------------------------
    clean:
      @echo clean ...
      @rm -fr $(BUILD) $(OUTPUT).elf $(OUTPUT).dol
    
    #---------------------------------------------------------------------------------
    run:
      wiiload $(TARGET).dol
    
    
    #---------------------------------------------------------------------------------
    else
    
    DEPENDS	:=	$(OFILES:.o=.d)
    
    #---------------------------------------------------------------------------------
    # main targets
    #---------------------------------------------------------------------------------
    $(OUTPUT).dol: $(OUTPUT).elf
    $(OUTPUT).elf: $(OFILES)
    
    $(OFILES_SOURCES) : $(HFILES)
    
    #---------------------------------------------------------------------------------
    # This rule links in binary data with the .jpg extension
    #---------------------------------------------------------------------------------
    %.jpg.o	%_jpg.h :	%.jpg
    #---------------------------------------------------------------------------------
      @echo $(notdir $<)
      $(bin2o)
    
    -include $(DEPENDS)
    
    #---------------------------------------------------------------------------------
    endif
    #---------------------------------------------------------------------------------
    `
    require("fs").mkdir("./wii-output-homebrew", (err => {if(err) {console.log(`\x1b[31mCompiler Error\x1b[0m - ${err.toString()}`);require("fs").mkdir("./wii-output-homebrew/source/", (err => {if(err) {console.log(`\x1b[31mCompiler Error\x1b[0m - ${err.toString()}`)
    
    require("fs").writeFile("./wii-output-homebrew/Makefile", Buffer.from(Makefile), (err) => {
      if(err) {
          console.log(`\x1b[31mCompiler Error\x1b[0m - ${err.toString()}`)
      }
      require("child_process").exec("\"make\" -C ./output/")
      console.log("\x1b[34mCompiler\x1b[0m - Done! created Makefile")
    require("fs").writeFile("./wii-output-homebrew/source/main.c", Buffer.from(cCode), (err) => {
        if(err) {
            console.log(`\x1b[31mCompiler Error\x1b[0m - ${err.toString()}`)
        }
        require("child_process").exec("\"make\" -C ./output/")
        console.log("\x1b[34mCompiler\x1b[0m - Done! finished compiling")
    });
  });
}}))}})) 
  }
}

module.exports = { App, util };
