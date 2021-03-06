cmake_minimum_required(VERSION 3.6)
enable_language(CXX) # SINCE Compiler/Platform variables do not normally exist before a project command in CMake.

get_filename_component(PARENT_DIR ${CMAKE_SOURCE_DIR} DIRECTORY)
get_filename_component(CPP_ROOT "../.." ABSOLUTE)

include(config.cmake OPTIONAL)

#SET(CMAKE_EXE_LINKER_FLAGS "-static")
set_property(GLOBAL PROPERTY USE_FOLDERS ON)
include("${CMAKE_TOOLS_PATH}/scripts/generator-key.cmake")

set(MYTHIC_DEPENDENCIES "${CPP_ROOT}/mythic/dependencies/${GENERATOR_KEY}")

set(LOCAL_HEADER 1)
include(local-config.cmake OPTIONAL)

if (NOT MINGW)
  project(archmage)
  set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
else ()
  set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
endif ()

include("${CMAKE_TOOLS_PATH}/cmake-tools.cmake")

macro(initialize_boost_library name)
  set(boost_lib_${name} "${BOOST_PATH}/bin.v2/libs/${name}/build/${BOOST_SUBDIRECTORY}/debug/link-static/libboost_${name}${BOOST_LIBRARY_SUFFIX}")
#  file(COPY ${boost_lib_${name}} DESTINATION ${CMAKE_RUNTIME_OUTPUT_DIRECTORY})
endmacro()

initialize_boost_library(filesystem)
initialize_boost_library(regex)
initialize_boost_library(system)

#add_definitions("-DRAPIDJSON_ASSERT(x)")

add_subdirectory(projects/repoman)
add_subdirectory(projects/projection)
add_subdirectory(projects/archmage_cpp)
add_subdirectory(projects/archmage_loading)
add_subdirectory(projects/archmage_reporting)
add_subdirectory(projects/archmage)
add_subdirectory(projects/archmage_cli_library)
add_subdirectory(projects/archmage_cli)
add_subdirectory(test/archmage_test)

finish_cmake()
