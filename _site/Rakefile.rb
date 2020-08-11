desc 'Delete generated _site files'
task :clean do
  system "rm -fR _site"
end

desc 'Run the jekyll dev server'
task :serve do
  system "jekyll serve --watch --baseurl="
end

task :default => :serve